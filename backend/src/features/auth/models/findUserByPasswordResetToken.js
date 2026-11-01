const { getDb } = require("../../../db/mongo");

module.exports = async ({ hashedToken }) => {
    const db = getDb();

    return db.collection("users").findOne({
        passwordResetTokenHash: hashedToken,
    });
};
