import type { Request, Response } from 'express';
import { Router } from 'express';
import { cpus, arch, machine, platform } from 'node:os';
import { uptime } from 'node:process';

const healthRouter = Router();

healthRouter.route('/').get((_: Request, res: Response) => {
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
