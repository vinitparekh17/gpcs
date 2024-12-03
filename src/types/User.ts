import type { JwtPayload } from 'jsonwebtoken';

type UserRole = 'USER' | 'ADMIN';

export type User = {
	id?: string;
	firstName: string;
	lastName: string;
	email: string;
	password?: string;
	role: UserRole | null;
	profile: string | null;
	forgotpasstoken: string | null;
	forgotpassexpire: number | null;
	createdAt: Date;
};

export interface IUser extends User {
	insert(): Promise<User | Error>;
	resetPassword(password: string): Promise<void>;
	getForgotTokenAndSave: () => Promise<string>;
	getJWT(): string;
}

declare global {
	namespace Express {
		interface User extends IUser {}
	}
}

export interface CustomPayload extends JwtPayload {
	data: {
		id: string;
		name: string;
		email: string;
		profile: string;
	};
}
