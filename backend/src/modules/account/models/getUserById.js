const {getDb, ObjectId} = require("../../../db/mongo");


module.exports = async ({userId}) => {
    const db = getDb();
    const filter = {_id: new ObjectId(userId)};

    const user = await db.collection("users").findOne(filter);

    return user;
}
