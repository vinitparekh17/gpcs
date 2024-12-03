import jwt from 'jsonwebtoken';
import { Logger } from './index.ts';
import { JWT_SECRET } from '../config/index.ts';
import { CustomPayload } from '../types/index.ts';

export class JwtHelper {
	static verifyToken(token: string): jwt.JwtPayload | string {
		try {
			let decoded: jwt.JwtPayload | string = jwt.verify(
				token,
				JWT_SECRET || 'default-secret',
			);
			if (typeof decoded !== 'string') {
				if (decoded.exp && decoded.exp < Date.now().valueOf() / 1000) {
					decoded = 'expired';
					return decoded;
				}
				return decoded;
			}
			return 'invalid';
		} catch (error: unknown) {
			if (error instanceof Error) {
				Logger.error(error.message);
			}
			return 'error';
		}
	}

	static getUserIdFromToken(token: string): string {
		try {
			const decoded = this.verifyToken(token);
			const { data } = decoded as CustomPayload;
			return data.id;
		} catch (error: unknown) {
			if (error instanceof Error) {
				Logger.error(error);
			}
			return '';
		}
	}
}
