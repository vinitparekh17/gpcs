import { Message } from '../db/cassandra/model/Message.ts';
import { Logger } from './Logger.ts';

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
