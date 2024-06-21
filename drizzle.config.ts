import type { Config } from 'drizzle-kit';
import { AWS_RDS_DATABASE_URL } from './src/config';

export default {
    dialect: 'postgresql',
    schema: './src/db/postgresql/schema',
    out: './.drizzle',
    breakpoints: false,
    dbCredentials: {
        url: AWS_RDS_DATABASE_URL,
    },
} satisfies Config;
