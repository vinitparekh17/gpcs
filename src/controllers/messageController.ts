import type { Request, Response } from 'express';
import type { Message as MessageType } from '../types/Message.ts';
import { Message } from '../db/cassandra/model/Message.ts';
import { AsyncHandler } from '../handlers/index.ts';
import { Success } from '../utils/Responders.ts';

export const getConversation = AsyncHandler(
	async (req: Request, res: Response) => {
		const { uid } = req.params;
		const data = await Message.findByUser(uid);
		if (data.length > 0) return Success.send(res, 200, data);
		return Success.send(res, 200, [] as MessageType[]);
	},
);
