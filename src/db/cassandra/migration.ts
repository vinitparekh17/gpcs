import { Client } from 'cassandra-driver';
import { cassandraClient } from './connect';
import { Logger } from '../../utils';

export interface Migration {
    up(client: Client): Promise<void>;
    down(client: Client): Promise<void>;
}

class MigrationRunner {
    constructor(private client: Client) {
        client.connect();
    }

    async run(migration: Migration) {
        await migration.up(this.client);
        await this.client.shutdown();
    }

    async rollback(migration: Migration) {
        await migration.down(this.client);
        await this.client.shutdown();
    }
}

class CassandraMigration implements Migration {
    async up(client: Client) {
        Logger.debug('Running cassandra migrations');

        await client.execute(
            `CREATE KEYSPACE "messaging"
      WITH
        REPLICATION = {
          'class':'SingleRegionStrategy'
        }`
        );
        await client.execute(`
        CREATE TABLE IF NOT EXISTS messaging.messages (
            user text,
            assistant text,
            id uuid,
            prompt text,
            response text,
            created timestamp,
            PRIMARY KEY ((user, assistant), id)
        ) WITH CLUSTERING ORDER BY (id DESC);`);

        Logger.debug('Cassandra migrations complete');
    }

    async down(client: Client) {
        Logger.debug('Rolling back cassandra migrations');

        await client.execute(`DROP TABLE IF EXISTS messaging.messages;`);
        await client.execute(`DROP KEYSPACE IF EXISTS messaging;`);
        Logger.debug('Cassandra migrations rolled back');
    }
}

const args = process.argv.slice(2);
const migrationRunner = new MigrationRunner(cassandraClient);

switch (args[0]) {
    case 'up':
        migrationRunner
            .run(new CassandraMigration())
            .then(() => process.exit(0))
            .catch((err) => {
                throw err;
            });
        break;
    case 'down':
        migrationRunner
            .rollback(new CassandraMigration())
            .then(() => process.exit(0))
            .catch((err) => {
                throw err;
            });
        break;
    default:
        break;
}
