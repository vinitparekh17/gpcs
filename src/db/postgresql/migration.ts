import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db, pgClient } from "./connect.ts";
import { Logger } from "../../utils/index.ts";

(async () => {
  try {
    await migrate(db, {
      migrationsFolder: "./.drizzle",
      migrationsTable: "accounts",
      migrationsSchema: "omnisive",
    })
      .then(async () => {
        Logger.info("Migration completed");
        await pgClient
          .end()
          .then(() => {
            Logger.debug("Db Connection closed...");
          })
          .catch((error: Error) => {
            Logger.error(error);
          });
      })
      .catch((error: Error) => {
        throw error;
      });
  } catch (error: unknown) {
    if (error instanceof Error) {
      Logger.error(`Error occured while migration: ${error.message}`);
      throw error;
    }
  }
})();
