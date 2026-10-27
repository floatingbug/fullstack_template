const {getDb, ObjectId} = require("../../../db/mongo");

module.exports = async ({newName, userId}) => {
    const db = getDb();

    const result = await db.collection("users").updateOne(
        {
            _id: new ObjectId(userId),
        },
        {
            $set: {
                name: newName,
            },
        },
    );

    return result;
}
