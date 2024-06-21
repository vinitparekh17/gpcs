import { GenerativeModel } from '../lib/gcp/vertex';

export const AiResponder = async (
    text: string,
    callback: (response: string, isCompleted: boolean, err: Error) => void
): Promise<void> => {
    try {
        console.time('generateContentStream');
        const responseStream = await GenerativeModel.generateContentStream({
            contents: [
                {
                    role: 'user',
                    parts: [{ text }],
                },
            ],
        });

        let completeResponse = '';

        for await (const chunks of responseStream.stream) {
            if (chunks.candidates[0].finishReason === 'SAFETY') {
                completeResponse = 'SAFETY';
                callback(completeResponse, true, null);
            } else {
                completeResponse += chunks.candidates[0].content.parts[0].text;
                callback(
                    chunks.candidates[0].content.parts[0].text,
                    false,
                    null
                );
            }
        }
        callback(completeResponse, true, null);

        console.timeEnd('generateContentStream');
    } catch (error) {
        callback(null, null, error);
    }
};
