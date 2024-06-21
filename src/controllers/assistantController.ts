import { Request, Response } from 'express';
import { Err, Logger, Success } from '../utils';
import { AsyncHandler } from '../handlers';
import { Assistant } from '../db/postgresql/models/Assistant';

export const getAssistant = AsyncHandler(
    async (req: Request, res: Response) => {
        if (!req.user || !req.user.id) {
            throw new Error('User not found');
        }

        const assistant = await Assistant.getByUserId(req.user.id);
        if (assistant.length === 0) {
            return Err.send(res, 404, 'You do not have an assistant');
        }
        return Success.send(res, 200, assistant);
    }
);

export const createAssistant = AsyncHandler(
    async (req: Request, res: Response) => {
        const { name, preConfig, avatar } = req.body as AssistantInput;
        if (!name || !preConfig) {
            return Err.send(res, 400, 'Name and preConfig are required');
        }

        const assistant = new Assistant({
            avatar,
            name,
            preConfig,
            type: 'CUSTOM',
            userId: req.user.id!,
            createdAt: new Date(),
        });

        return assistant
            .insert()
            .then((assistant) => Success.send(res, 201, assistant))
            .catch((err: Error) => {
                Logger.error(err);
                return Err.send(res, 501, err.message);
            });
    }
);

export const publishAssistant = AsyncHandler((req: Request, res: Response) => {
    const { assistantId } = req.params;

    if (assistantId) {
        return Assistant.publish(assistantId)
            .then((publishStatus) => {
                if (publishStatus)
                    return Success.send(
                        res,
                        200,
                        'Your assistant has been published for community'
                    );

                return Err.send(res, 401, 'Unable to publish your assistant');
            })
            .catch((err: Err) => {
                Logger.error(err);
                return Err.send(res, 400, 'Something went wrong');
            });
    }

    return Err.send(res, 400, 'Assistant id not found');
});

export const updateAssistant = AsyncHandler((req: Request, res: Response) => {
    const { name, preConfig, avatar } = req.body as AssistantInput;

    if (!name || !preConfig) {
        return Err.send(res, 400, 'Name and preConfig are required');
    }

    return Assistant.update(
        {
            id: req.params.id,
            userId: req.user.id!,
            name,
            preConfig,
            avatar,
        },
        req.params.id
    )
        .then((assistant) => Success.send(res, 200, assistant))
        .catch((err: Err) => {
            Logger.error(err);
            return Err.send(res, 400, 'Something went wrong');
        });
});
