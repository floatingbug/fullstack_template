const { MongoClient, ObjectId } = require('mongodb');
const config = require('../config');
const logger = require('../utils/logger');

let client;
let db;

/**
 * Name and email are login identifiers, so they must be unique.
 * Existing duplicates only get logged: the server still starts and the
 * unique constraint applies to new documents as soon as it can be built.
 */
async function ensureIndexes(database) {
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

async function connect() {
    if (db) {
        return db;
    }

    client = new MongoClient(config.mongoUri);

    await client.connect();

    db = client.db(config.dbName);

    await ensureIndexes(db);

    return db;
}

function getDb() {
    if (!db) {
        throw new Error('Database not connected. Call connect() first.');
    }

    return db;
}

module.exports = {
    connect,
    getDb,
    ObjectId,
    _client: () => client
};
