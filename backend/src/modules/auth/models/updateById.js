const { ObjectId } = require('mongodb');
const { getDb } = require('../../../db/mongo');


module.exports = async ({ id, update }) => {
    const db = getDb();
    return db
        .collection('users')
        .updateOne({ _id: new ObjectId(id) }, { $set: update });
};
