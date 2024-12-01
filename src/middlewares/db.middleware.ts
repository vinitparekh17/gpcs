import { cassandraClient } from "../db/cassandra/connect.ts";
import "../db/postgresql/connect.ts";
import redis from "../db/redis/index.ts";
import { Logger } from "../utils/index.ts";

export const useDatabase = () => {
  setTimeout(() => {
    cassandraClient
      .connect()
      .then(() => {
        Logger.info("Connected to Cassandra");
      })
      .catch((err: Error) => {
        Logger.error("Error connecting to Cassandra: " + err.message);
      });
  }, 5000);

  redis
    .connect()
    .then(() => {
      Logger.info("Connected to Redis");
    })
    .catch((err) => {
      Logger.error("Error connecting to Redis", err);
    });
};
