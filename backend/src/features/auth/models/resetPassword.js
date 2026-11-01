const { getDb, ObjectId } = require("../../../db/mongo");

module.exports = async ({ userId, hashedPassword }) => {
    const db = getDb();

    return db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        {
            $set: {
                password: hashedPassword,
            },
            $unset: {
                passwordResetTokenHash: "",
                passwordResetExpiresAt: "",
            },
        }
    );
};

