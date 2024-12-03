import { io } from '../index.ts';
import type { Socket } from 'socket.io';
import { CustomPayload } from '../types/index.ts';
import { JwtHelper, Logger } from '../utils/index.ts';
import redis from '../db/redis/index.ts';

export function SocketMiddleware() {
	try {
		if (io) {
			io.use(async (socket, next) => {
				const token = getCookieToken(socket);
				if (!token) {
					return new Error('Unauthorized');
				}
				const decoded = JwtHelper.verifyToken(token);
				if (decoded === 'expired') {
					next(new Error('Token expired'));
				} else if (decoded === 'error') {
					next(new Error('Invalid token'));
				} else if (decoded === 'invalid') {
					next(new Error('Invalid token'));
				} else {
					const { data } = decoded as CustomPayload;
					if (data !== undefined) {
						const result = await redis.set(data.id, socket.id);
						if (result) {
							next();
						} else {
							next(new Error('Cache error'));
						}
					}
				}
			});
		}
	} catch (error) {
		Logger.error('SocketMiddleware: ' + error);
	}
}

function getCookieToken(socket: Socket): string | undefined {
	try {
		const cookieString = socket.request.headers.cookie;
		const cookieObj: { [key: string]: string } = {};
		if (cookieString !== undefined) {
			cookieString.split(';').forEach((cookie: string) => {
				const [name, value] = cookie.trim().split('=');
				cookieObj[name] = value;
			});
			return cookieObj['jwt-token'];
		}
	} catch (error) {
		console.log(error);
	}
}

export { getCookieToken };
