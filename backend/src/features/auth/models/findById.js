const { getDb, ObjectId } = require('../../../db/mongo');

module.exports = async ({ userId }) => {
    if (!userId || !ObjectId.isValid(userId)) {
        return null;
    }

    const db = getDb();

    return db.collection('users').findOne({ _id: new ObjectId(userId) });
};
