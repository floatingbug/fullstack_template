const { getDb, ObjectId } = require("../../../db/mongo");

module.exports = async ({ userId }) => {
    const db = getDb();

    return db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        {
            $set: { emailVerified: true },
            $unset: {
                emailTokenHash: "",
                emailTokenExpiresAt: "",
            },
        }
    );
};
