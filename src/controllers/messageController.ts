import type { Request, Response } from 'express';
import type { Message as MessageType } from '../interface/Message';
import { Message } from '../db/cassandra/model/Message';
import { AsyncHandler } from '../handlers';
import { Success } from '../utils/Responders';

export const getConversation = AsyncHandler(
    async (req: Request, res: Response) => {
        const { uid } = req.params;
        const data = await Message.findByUser(uid);
        if (data.length > 0) return Success.send(res, 200, data);
        return Success.send(res, 200, new Array() as MessageType[]);
    }
);
