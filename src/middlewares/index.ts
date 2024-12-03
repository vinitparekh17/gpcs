// @deno-types="npm:@types/express@^5.0"
import express, { Request, Response } from 'npm:express';
import { rateLimit } from 'express-rate-limit';
import morgan, { StreamOptions } from 'morgan';

// @deno-types="npm:@types/cookie-parser@1.4"
import cookieParser from 'npm:cookie-parser';
import { Err, Logger } from '../utils/index.ts';

import { corsConfig } from './cors.middleware.ts';
// import { ErrorHandler } from './err.middleware.ts';
import { app } from '../app.ts';
import process from 'node:process';

export const useMiddleware = function () {
	try {
		const stream: StreamOptions = { write: (m) => Logger.http(m) };
		const skip = (): boolean => {
			const env = process.env.NODE_ENV || 'development';
			return env !== 'development';
		};

		app.use(
			morgan(
				':method :url :status :res[content-length] - :response-time ms',
				{
					stream,
					skip,
				},
			),
		);

		app.use(cookieParser() as unknown as express.RequestHandler);

		app.use(express.json());

		app.use(corsConfig);

		if (process.env.NODE_ENV === 'production') {
			app.use(
				rateLimit({
					windowMs: 5 * 60 * 1000,
					max: 90,
					handler: (_: Request, res: Response) => {
						Err.send(res, 429, 'Too many requests are not allowed');
					},
					standardHeaders: true,
					legacyHeaders: false,
				}),
			);
		}
		// app.use(ErrorHandler());
	} catch (error: unknown) {
		if (error instanceof Error) {
			Logger.error('Middlewares ' + error.message, error.stack);
		} else {
			Logger.error(error);
		}
	}
};
