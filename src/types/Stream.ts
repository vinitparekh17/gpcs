export enum SocketEvents {
  REQUEST_TEXT_STREAM = "request-text-stream",
  REQUEST_AUDIO_STREAM = "request-audio-stream",
  REQUEST_PROMPT_TEXT = "request-prompt-text",
  RESPONSE_TEXT_STREAM = "response-text-stream",
  RESPONSE_AUDIO_STREAM = "response-audio-stream",
  DISCONNECT = "disconnect",
  CONNECT = "connect",
}

export interface RequestAudio {
  audio: Int16Array;
  sampleRateHertz: number;
}

export interface ChunkObj {
  candidates: [
    {
      content: {
        parts: [
          {
            text: string;
          },
        ];
      };
    },
  ];
}
