import type { ConnectionOptions } from 'node:tls';
import { Sha256 } from '@aws-crypto/sha256-js';
import {
    AWS_ACCESS_KEY_ID,
    AWS_REGION,
    AWS_SECRET_ACCESS_KEY,
    NODE_ENV,
} from '../../config';
import { readFileSync } from 'fs';
import { SignatureV4, createScope } from '@smithy/signature-v4';
import { createHash } from 'crypto';
import { Client, auth } from 'cassandra-driver';
import path from 'node:path';

class SigV4Authenticator implements auth.Authenticator {
    private readonly region: string;
    private readonly accessKeyId: string;
    private readonly secretAccessKey: string;
    public static readonly AWS4_SIGNING_ALGORITHM = 'AWS4-HMAC-SHA256';

    constructor(props: {
        region: string;
        accessKeyId: string;
        secretAccessKey: string;
    }) {
        this.region = props.region;
        this.accessKeyId = props.accessKeyId;
        this.secretAccessKey = props.secretAccessKey;
    }

    /* Calling class expects to be a method, so cannot make static even though it is a static function */
     
    initialResponse = (
        callback: (error: Error | null, buffer: Buffer | null) => void
    ): void => {
        callback(null, Buffer.from('SigV4\0\0', 'utf8'));
    };

    private static handleError =
        (callback: (error: Error | null, buffer: Buffer | null) => void) =>
            (err: unknown): void => {
                callback(
                    err instanceof Error ? err : new Error(JSON.stringify(err)),
                    null
                );
            };

    private handleSignature =
        (
            timestamp: string,
            callback: (error: Error | null, buffer: Buffer | null) => void
        ) =>
            (signature: string): void => {
                const payload = `signature=${signature},access_key=${this.accessKeyId},amzdate=${timestamp}`;
                callback(null, Buffer.from(payload, 'utf-8'));
            };

    evaluateChallenge = (
        challenge: Buffer,
        callback: (error: Error | null, buffer: Buffer | null) => void
    ) => {
        const res = challenge.toString().split('nonce=');

        if (res.length < 2) {
            callback(
                new Error(`could not parse nonce: ${challenge.toString()}`),
                null
            );
            return;
        }

        const nonce = res[1].split(',')[0];

        const timestamp = new Date().toISOString();
        /*eslint no-useless-escape: "off"*/
        const timestampDate = timestamp
            .replace(/[:\-]|\.\d{3}/g, '')
            .slice(0, 8);

        const nonceHash = Buffer.from(
            createHash('sha256').update(nonce, 'utf-8').digest()
        ).toString('hex');

        const scope = createScope(timestampDate, this.region, 'cassandra');

        const headers = [
            `X-Amz-Algorithm=${SigV4Authenticator.AWS4_SIGNING_ALGORITHM}`,
            `X-Amz-Credential=${this.accessKeyId}%2F${encodeURIComponent(
                scope
            )}`,
            `X-Amz-Date=${encodeURIComponent(timestamp)}`,
            'X-Amz-Expires=900',
        ].sort();

        const canonicalRequest = `PUT\n/authenticate\n${headers.join(
            '&'
        )}\nhost:cassandra\n\nhost\n${nonceHash}`;

        const digest = Buffer.from(
            createHash('sha256').update(canonicalRequest, 'utf-8').digest()
        ).toString('hex');

        const stringToSign = `${SigV4Authenticator.AWS4_SIGNING_ALGORITHM}\n${timestamp}\n${scope}\n${digest}`;

        const signer = new SignatureV4({
            service: 'cassandra',
            region: this.region,
            credentials: {
                accessKeyId: this.accessKeyId,
                secretAccessKey: this.secretAccessKey,
            },
            sha256: Sha256,
        });
        signer
            .sign(stringToSign)
            .then(this.handleSignature(timestamp, callback))
            .catch(SigV4Authenticator.handleError(callback));
    };

    /* Calling class expects to be a method, so cannot make static even though it is a static function */
     
    onAuthenticationSuccess = (): void => { };
}

class SigV4AuthProvider implements auth.AuthProvider {
    private readonly region: string;
    private readonly accessKeyId: string;
    private readonly secretAccessKey: string;

    constructor(props: {
        region?: string;
        accessKeyId: string;
        secretAccessKey: string;
    }) {
        Object.setPrototypeOf(this, auth.PlainTextAuthProvider.prototype);
        const region = props.region || AWS_REGION;
        if (!region) throw new Error('no AWS region specified');
        this.region = region;
        this.accessKeyId = props.accessKeyId;
        this.secretAccessKey = props.secretAccessKey;
    }

    newAuthenticator = (): auth.Authenticator =>
        new SigV4Authenticator({
            region: this.region,
            accessKeyId: this.accessKeyId,
            secretAccessKey: this.secretAccessKey,
        });
}

const sslOptions: ConnectionOptions = {
    ca: [
        readFileSync(
            path.join(
                __dirname,
                '..',
                '..',
                '..',
                'cert',
                'sf-class2-root.crt'
            ), // Path at root of project
            'utf-8'
        ),
    ],
    host: `cassandra.${AWS_REGION}.amazonaws.com`,
    rejectUnauthorized: true,
};

export const cassandraClient = NODE_ENV !== 'development' ? new Client({
    contactPoints: [`cassandra.${AWS_REGION}.amazonaws.com`],
    localDataCenter: AWS_REGION,
    authProvider: new SigV4AuthProvider({
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    }),
    sslOptions: sslOptions,
    protocolOptions: { port: 9142 },
}) : new Client({
    contactPoints: ['cassandra'],
    localDataCenter: 'datacenter1',
    protocolOptions: { port: 9042 }
});