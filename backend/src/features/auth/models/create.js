const { getDb } = require('../../../db/mongo');

module.exports = async ({user}) => {
    const db = getDb();

    return db.collection('users').insertOne(user);
};
