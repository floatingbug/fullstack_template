const {getDb} = require("../../../db/mongo");


module.exports = async ({hashedToken}) => {
    const db = getDb();
    const filter = {pendingEmailToken: hashedToken};

    const result = await db.collection("users").findOne(filter);

    return result;
};
