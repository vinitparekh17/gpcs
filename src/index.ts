import type { Server } from 'node:http';
import process from 'node:process';
import { app } from './app';
import { SocketMiddleware } from './middlewares/socket.middleware';
import { SocketServer } from './lib/socket.io/Socket';
import { Logger } from './utils/';
import redis from './db/redis';
import { PORT } from './config';

const server: Server = app.listen(PORT, () => {
    Logger.info(`Server is running on ${PORT}`);
});

export const socketServer: SocketServer = new SocketServer(server);
export const { io } = SocketServer;
SocketMiddleware();

process.on('SIGINT', () => {
    redis
        .flushAll()
        .then(() => {
            server.close(() => {
                Logger.info('Server closed');
            });
        })
        .catch((error: Error) => console.error(error));
});
