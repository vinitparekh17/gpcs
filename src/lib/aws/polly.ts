import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import { awsConfig } from "./index.ts";

export const pollyClient = new PollyClient(awsConfig);

/**
 * This is pre configured polly command to synthesize speech
 * @function pollyCommand
 * @param text: string - Text to be converted to speech
 * @returns SynthesizeSpeechCommand
 */

export const pollyCommand = (text: string) =>
  new SynthesizeSpeechCommand({
    Engine: "neural",
    LanguageCode: "en-GB",
    OutputFormat: "mp3",
    SampleRate: "8000",
    Text: text,
    VoiceId: "Arthur",
  });
