import { app } from '../app';
import { cassandraClient } from '../db/cassandra/connect';
import '../db/postgresql/connect';
import redis from '../db/redis';
import { Logger } from '../utils';

app.useDatabase = () => {
    cassandraClient
        .connect()
        .then(() => {
            Logger.info('Connected to Cassandra');
        })
        .catch((err) => {
            Logger.error('Error connecting to Cassandra', err);
        });

    redis
        .connect()
        .then(() => {
            Logger.info('Connected to Redis');
        })
        .catch((err) => {
            Logger.error('Error connecting to Redis', err);
        });
};
