import { sql } from 'drizzle-orm';

import {
    pgEnum,
    uuid,
    pgSchema,
    varchar,
    timestamp,
    index,
    bigint,
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['USER', 'ADMIN']);

export const userSchema = pgSchema('user');

export const accountTable = userSchema.table(
    'account',
    {
        id: uuid('id')
            .primaryKey()
            .default(sql`gen_random_uuid()`),
        firstName: varchar('first_name', { length: 50 }).notNull(),
        lastName: varchar('last_name', { length: 50 }).notNull(),
        email: varchar('email', { length: 256 }).notNull().unique('email'),
        password: varchar('password', { length: 256 }).notNull(),
        role: roleEnum('role').default('USER'),
        profile: varchar('profile', { length: 1024 }),
        forgotpasstoken: varchar('forgotPassToken', { length: 512 }),
        forgotpassexpire: bigint('forgotPassExpire', { mode: 'number' }),
        createdAt: timestamp('createdAt').notNull().defaultNow(),
    },
    (account) => ({
        emailIdx: index('usr_email').on(account.email),
    })
);
