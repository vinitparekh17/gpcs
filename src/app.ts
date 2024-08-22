import express from 'express';
import promClient from './lib/prometheus';
import type { Application, Request, Response } from 'express';

export const app: Application = express();

import router from './routes';

import './middlewares';

(async () => {
    try {
        app.useMiddleware();

        app.useDatabase();

        app.usePassport();

        app.get('/metrics', async (req: Request, res: Response) => {
            res.setHeader('Content-Type', promClient.register.contentType);
            const metrics = await promClient.register.metrics()
            res.send(metrics);
        })

        app.use('/api/v1', router);

        app.all('*', (req: Request, res: Response) => {
            const err = Error(`Requested path: ${req.path} not found!`);
            res.status(404).json({
                success: false,
                message: err.message,
                stack: err.stack,
            });
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw error;
        }
    }
})();
