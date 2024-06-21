import type { JwtPayload } from 'jsonwebtoken';

type UserRole = 'USER' | 'ADMIN';

export type User = {
    id?: string;
    firstName: string;
    lastName: string;
    profile?: string;
    email: string;
    password?: string;
    role?: UserRole;
    forgotpasstoken?: string;
    forgotpassexpire?: number;
    createdAt?: Date;
};

export interface IUser extends User {
    insert(): Promise<User>;
    resetPassword(password: string): Promise<void>;
    getForgotTokenAndSave: () => Promise<string>;
    getJWT(): string;
}

declare module 'express' {
    interface Request {
        user: IUser;
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
