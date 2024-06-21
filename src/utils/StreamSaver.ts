import { Message } from '../db/cassandra/model/Message';
import { Logger } from './Logger';

export class StreamSaver {
    static async saveStream(from: string, prompt: string, res: string) {
        try {
            await new Message({
                prompt: prompt,
                response: res,
                user: from,
            }).insert();
        } catch (error) {
            Logger.error(error);
        }
    }
}
