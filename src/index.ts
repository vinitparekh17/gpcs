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

const shutdownTimeout = setTimeout(() => {
    Logger.error('Shutdown timed out. Forcing exit.');
    process.exit(1);
  }, 10000); // 10 seconds timeout
  
  let activeRequests = 0;
  server.on('request', (req, res) => {
    activeRequests++;
    res.on('finish', () => activeRequests--);
  });
  
  const gracefulShutdown = async () => {
    try {
      Logger.info('Waiting for active requests to finish...');
      
      const maxWaitTime = 5000; // 5 seconds
      const startTime = Date.now();
      
      while (activeRequests > 0) {
        if (Date.now() - startTime > maxWaitTime) {
          Logger.warn(`Timeout waiting for ${activeRequests} active requests`);
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 100)); // Poll every 100ms
      }
      
      Logger.info('No active requests. Shutting down...');
      clearTimeout(shutdownTimeout);
      await redis.flushAll();
      
      server.close(() => {
        Logger.info('Shutdown complete');
        process.exit(0);
      });
    } catch (error) {
      Logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  };
  
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);