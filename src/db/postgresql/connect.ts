import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as account from './schema/account';
import * as assistant from './schema/assistant';
import { AWS_RDS_DATABASE_URL } from '../../config';
import { Logger } from '../../utils';

export const pgClient = postgres(AWS_RDS_DATABASE_URL, {
    keep_alive: -1,
    connect_timeout: 3000,
    ssl: 'allow',
});

export const db = drizzle(pgClient, { schema: { account, assistant } });

Logger.info('RDS Connected...');
