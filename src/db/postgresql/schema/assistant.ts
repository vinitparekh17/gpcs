import { sql } from 'drizzle-orm';
import { accountTable, userSchema } from './account';
import {
    uuid,
    varchar,
    index,
    text,
    pgEnum,
    timestamp,
} from 'drizzle-orm/pg-core';
import { DefaultAssistanConfig } from '../../../config';

const typeEnum = pgEnum('type', ['CUSTOM', 'COMMUNITY']);

export const AssistantTable = userSchema.table(
    'assistant',
    {
        id: uuid('id')
            .primaryKey()
            .default(sql`gen_random_uuid()`),
        name: varchar('name', { length: 256 })
            .default('omni-bot')
            .unique()
            .notNull(),
        preConfig: text('pre_config').default(DefaultAssistanConfig).notNull(),
        avatar: varchar('avatar', { length: 2048 }),
        type: typeEnum('type').default('CUSTOM').notNull(),
        userId: uuid('user_id')
            .notNull()
            .references(() => accountTable.id),
        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (assistant) => ({
        userIdIdx: index('ast_user_id').on(assistant.userId),
    })
);
