import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../handlers';

export function ErrorHandler() {
    return async (
        err: ApiError,
        _: Request,
        res: Response,
        next: NextFunction
    ) => {
        const statusCode = err.statusCode || 500;
        res.status(statusCode).send({
            success: false,
            message: err.message,
            stack: err.stack,
        });
        next();
    };
}
