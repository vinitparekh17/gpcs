import type { Request, Response, NextFunction } from 'express';
import { Err } from '../utils/Responders';
import { Logger } from '../utils';

/**
 * @description
 * This function is a wrapper for async functions to catch any errors and send them to the client.
 * @function AsyncHandler
 * @param fn: Function
 */

export default (fn: (req: Request, res: Response, next: NextFunction) => Promise<Response> | Response): (req: Request, res: Response, next: NextFunction) => void =>
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch((err: Error) => {
            Logger.error(err.message);
            Err.send(res, 500, err.message);
            next(err);
        });
    };
