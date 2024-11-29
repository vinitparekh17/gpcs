import { db } from '../connect';
import jwt from 'jsonwebtoken';
import { accountTable } from '../schema/account';
import { and, eq, gte } from 'drizzle-orm';
import { PostgresError } from 'postgres';
import { Logger } from '../../../utils';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { deleteObjectIfExist } from '../../../lib/aws/s3';
import url from 'node:url';
import type { IUser, User as UserType } from '../../../types';
import { JWT_EXPIRY, JWT_SECRET } from '../../../config';

export class User implements IUser {
    public id?: string;
    public firstName: string;
    public lastName: string;
    public profile?: string;
    public email: string;
    public password?: string;
    public role: 'USER' | 'ADMIN';
    public forgotpasstoken?: string;
    public forgotpassexpire?: number;
    public createdAt?: Date;

    constructor(user: UserType) {
        this.id = user.id;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.profile = user.profile;
        this.email = user.email;
        this.password = user.password;
        this.role = user.role ?? 'USER';
        this.forgotpasstoken = user.forgotpasstoken;
        this.forgotpassexpire = user.forgotpassexpire;
        this.createdAt = user.createdAt;
    }
    static async getAll(): Promise<UserType[]> {
        try {
            return await db.select().from(accountTable);
        } catch (error: unknown) {
            if (error instanceof PostgresError && error.code === '23505') {
                throw error;
            } else if (error instanceof Error) {
                Logger.error(error);
                throw error;
            }
        }
    }

    static async getById(id: string): Promise<UserType> {
        return await db
            .select()
            .from(accountTable)
            .where(eq(accountTable.id, id))
            .then((user) => user[0]);
    }

    async insert(): Promise<UserType> {
        try {
            return db
                .insert(accountTable)
                .values({
                    firstName: this.firstName,
                    lastName: this.lastName,
                    email: this.email,
                    password: this.password,
                    role: this.role,
                    profile: this.profile,
                })
                .returning({
                    id: accountTable.id,
                    firstName: accountTable.firstName,
                    lastName: accountTable.lastName,
                    email: accountTable.email,
                    profile: accountTable.profile,
                    role: accountTable.role,
                    createdAt: accountTable.createdAt,
                    forgotpasstoken: accountTable.forgotpasstoken,
                    forgotpassexpire: accountTable.forgotpassexpire,
                })
                .then((user) => user[0]);
        } catch (error: unknown) {
            if (error instanceof PostgresError && error.code === '23505') {
                throw error;
            } else if (error instanceof Error) {
                Logger.error(error);
                throw error;
            }
        }
    }

    getJWT(): string {
        Logger.debug(`THis dot id ${this.id}`);
        return jwt.sign({ data: { id: this.id } }, JWT_SECRET, {
            expiresIn: JWT_EXPIRY,
        });
    }

    static async getUserByEmail(email: string): Promise<IUser> {
        try {
            return await db
                .select()
                .from(accountTable)
                .where(eq(accountTable.email, email))
                .then((user) => (user.length > 0 ? new User(user[0]) : null));
        } catch (error: unknown) {
            if (error instanceof PostgresError && error.code === '23505') {
                Logger.error(error);
                throw error;
            }
            throw error;
        }
    }

    validatePassword(usersAndPassward: string): Promise<boolean> {
        return bcrypt
            .compare(usersAndPassward, this.password)
            .then((verify) => verify);
    }

    async getForgotTokenAndSave(): Promise<string> {
        try {
            const forgotToken = crypto.randomBytes(20).toString('hex');

            this.forgotpasstoken = forgotToken;
            this.forgotpassexpire = Date.now() + 5 * 60 * 1000;

            await db
                .update(accountTable)
                .set({
                    forgotpassexpire: this.forgotpassexpire,
                    forgotpasstoken: this.forgotpasstoken,
                })
                .where(eq(accountTable.id, this.id));

            return forgotToken;
        } catch (error: unknown) {
            Logger.error(error);
            throw error;
        }
    }

    static async getUserByForgotToken(token: string): Promise<User | null> {
        return await db
            .select()
            .from(accountTable)
            .where(
                and(
                    eq(accountTable.forgotpasstoken, token),
                    gte(accountTable.forgotpassexpire, Date.now())
                )
            )
            .then((user) => (user.length > 0 ? new User(user[0]) : null));
    }

    static async updateById(user: UserType, id: string): Promise<UserType> {
        try {
            return await db
                .update(accountTable)
                .set(user)
                .where(eq(accountTable.id, id))
                .returning({
                    id: accountTable.id,
                    firstName: accountTable.firstName,
                    lastName: accountTable.lastName,
                    email: accountTable.email,
                    profile: accountTable.profile,
                    role: accountTable.role,
                    createdAt: accountTable.createdAt,
                })
                .then((user) => user[0] as UserType);
        } catch (error: unknown) {
            Logger.error(error);
            throw error;
        }
    }

    static async deleteById(id: string): Promise<void> {
        try {
            const { profile } = (
                await db
                    .delete(accountTable)
                    .where(eq(accountTable.id, id))
                    .returning({ profile: accountTable.profile })
            )[0];
            const parsedUrl = url.parse(profile);
            const objectKey = decodeURIComponent(
                parsedUrl.pathname.substring(1)
            );
            await deleteObjectIfExist(objectKey);
        } catch (error: unknown) {
            Logger.error(error);
            throw error;
        }
    }

    public async resetPassword(password: string): Promise<void> {
        try {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);

            await db
                .update(accountTable)
                .set({
                    password: hash,
                    forgotpasstoken: null,
                    forgotpassexpire: null,
                })
                .where(eq(accountTable.id, this.id));
        } catch (error: unknown) {
            Logger.error(error);
            throw error;
        }
    }
}
