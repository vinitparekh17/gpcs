import {
  HarmBlockThreshold,
  HarmCategory,
  VertexAI,
} from "@google-cloud/vertexai";
import { GOOGLE_PROJECT_ID } from "../../config/index.ts";

const vertexai = new VertexAI({
  project: GOOGLE_PROJECT_ID,
  location: "asia-south1",
});

export const GenerativeModel = vertexai.preview.getGenerativeModel({
  model: "gemini-pro",
  generationConfig: {
    maxOutputTokens: 512,
  },
  systemInstruction: {
    role: "assistant",
    parts: [
      {
        text:
          "You are a chatbot named Jarvis with a sarcastic personality. respond to the user with a sarcastic tone and make sure to keep the conversation light-hearted. your maximum response length is 512 tokens.",
      },
    ],
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
  ],
});
