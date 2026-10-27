const {getDb} = require("../../../db/mongo");


module.exports = async ({ name }) => {
    const db = getDb();
    return await db.collection("users").findOne({name});
};
