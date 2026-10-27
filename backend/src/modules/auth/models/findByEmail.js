const { getDb } = require('../../../db/mongo');


module.exports = async ({ email }) => {
    const db = getDb();
    return db.collection('users').findOne({ email });
};
