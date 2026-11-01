import { MongoClient, ObjectId } from 'mongodb';
import type { Db } from 'mongodb';
import config from '../config/index.js';
import logger from '../utils/logger.js';

let client: MongoClient | undefined;
let db: Db | undefined;

/**
 * Name and email are login identifiers, so they must be unique.
 * Existing duplicates only get logged: the server still starts and the
 * unique constraint applies to new documents as soon as it can be built.
 */
async function ensureIndexes(database: Db): Promise<void> {
    try {
        await database
            .collection('users')
            .createIndex(
                { email: 1 },
                { unique: true, name: 'uniq_users_email' }
            );

        await database
            .collection('users')
            .createIndex(
                { name: 1 },
                { unique: true, name: 'uniq_users_name' }
            );
    }
    catch (err) {
        logger.error({ err }, 'Failed to create unique indexes for users');
    }
}

async function connect(): Promise<Db> {
    if (db) {
        return db;
    }

    client = new MongoClient(config.mongoUri);

    await client.connect();

    db = client.db(config.dbName);

    await ensureIndexes(db);

    return db;
}

function getDb(): Db {
    if (!db) {
        throw new Error('Database not connected. Call connect() first.');
    }

    return db;
}

const _client = (): MongoClient | undefined => client;

export { connect, getDb, ObjectId, _client };

export default {
    connect,
    getDb,
    ObjectId,
    _client,
};
