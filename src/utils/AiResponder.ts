import { GenerativeModel } from "../lib/gcp/vertex.ts";

export const AiResponder = async (
  text: string,
  callback: (response: string | null, isCompleted: boolean, err: Error | null) => void,
): Promise<void> => {
  try {
    console.time("generateContentStream");
    const responseStream = await GenerativeModel.generateContentStream({
      contents: [
        {
          role: "user",
          parts: [{ text }],
        },
      ],
    });

    let completeResponse = "";

    for await (const chunks of responseStream.stream) {
      if (chunks.candidates && chunks.candidates[0].finishReason === "SAFETY") {
        completeResponse = "SAFETY";
        callback(completeResponse, true, null);
      } else {
        if (chunks.candidates && chunks.candidates[0].content.parts[0].text) {
        completeResponse += chunks.candidates[0].content.parts[0].text;
        callback(
          chunks.candidates[0].content.parts[0].text,
          false,
          null,
        );
      }
      }
    }
    callback(completeResponse, true, null);

    console.timeEnd("generateContentStream");
  } catch (error) {
    if (error instanceof Error) {
    callback(null, true, error);
    }
  }
};
