const {getDb, ObjectId} = require("../../../db/mongo");


module.exports = async ({newPassword, userId}) => {
    const db = getDb();
    const filter = {
        _id: new ObjectId(userId),
    };
    const update = {
        $set: {
            password: newPassword,
        },
    };

    const result = await db.collection("users").updateOne(filter, update);

    return result;
};
