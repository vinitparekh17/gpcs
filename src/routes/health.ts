// @deno-types="npm:@types/express@^5.0"
import { Request, Response, Router } from 'express';
import { arch, cpus, machine, platform, uptime } from 'node:os';
import { Logger } from '../utils/index.ts';
import process from 'node:process';

const healthRouter = Router();

healthRouter.route('/').get((_req: Request, res: Response) => {
	Logger.info(
		`Request to /health has been made: ${new Date().toISOString()}`,
	);
	res.status(200).json({
		success: true,
		message: 'Server is running!',
		cpus: cpus().length,
		arch: arch(),
		machine: machine(),
		platform: platform(),
		uptime: uptime(),
		env: process.env.NODE_ENV,
	});
});

export default healthRouter;
