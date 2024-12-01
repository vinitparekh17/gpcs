import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as account from "./schema/account.ts";
import * as assistant from "./schema/assistant.ts";
import { AWS_RDS_DATABASE_URL, NODE_ENV } from "../../config/index.ts";
import { Logger } from "../../utils/index.ts";

export const pgClient = postgres(getPgURL(), {
  keep_alive: -1,
  connect_timeout: 3000,
  ssl: "allow",
});

function getPgURL(): string {
  return NODE_ENV === "development"
    ? "postgresql://localhost:5432"
    : AWS_RDS_DATABASE_URL || "";
}

export const db = drizzle(pgClient, { schema: { account, assistant } });

Logger.info("RDS Connected...");
