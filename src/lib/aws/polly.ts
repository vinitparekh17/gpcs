import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import {
    AWS_ACCESS_KEY_ID,
    AWS_REGION,
    AWS_SECRET_ACCESS_KEY,
} from '../../config';

export const pollyClient = new PollyClient({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
});

/**
 * This is pre configured polly command to synthesize speech
 * @function pollyCommand
 * @param text: string - Text to be converted to speech
 * @returns SynthesizeSpeechCommand
 */

export const pollyCommand = (text: string) =>
    new SynthesizeSpeechCommand({
        Engine: 'neural',
        LanguageCode: 'en-GB',
        OutputFormat: 'mp3',
        SampleRate: '8000',
        Text: text,
        VoiceId: 'Arthur',
    });
