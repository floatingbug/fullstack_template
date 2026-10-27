const { getDb, ObjectId } = require("../../../db/mongo");

module.exports = async ({
    userId,
    passwordResetTokenHash,
    passwordResetExpiresAt,
}) => {
    const db = getDb();

    return db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        {
            $set: {
                passwordResetTokenHash,
                passwordResetExpiresAt,
            },
        }
    );
};
