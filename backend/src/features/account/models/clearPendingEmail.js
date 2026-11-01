const { getDb, ObjectId } = require("../../../db/mongo");

module.exports = async ({ userId }) => {
    const db = getDb();

    return db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        {
            $unset: {
                pendingEmail: "",
                pendingEmailToken: "",
                pendingEmailExpiresAt: "",
                // Without a pending change there is no reason to keep the cooldown.
                emailChangeLastRequestedAt: "",
            },
        }
    );
};
