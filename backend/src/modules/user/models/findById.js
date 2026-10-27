const { getDb, ObjectId } = require('../../../db/mongo');


module.exports = async ({ userId }) => {
    const db = getDb();

    return db.collection('users').findOne({ _id: new ObjectId(userId) });
};
