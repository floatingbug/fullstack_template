const { getDb } = require('../../../db/mongo');


module.exports = async ({ emailTokenHash }) => {
    const db = getDb();
    return db.collection('users').findOne({ emailTokenHash });
};
