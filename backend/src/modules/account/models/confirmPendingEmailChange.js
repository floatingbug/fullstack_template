const { getDb, ObjectId } = require("../../../db/mongo");

module.exports = async ({ userId }) => {
    const db = getDb();

    const filter = {
        _id: new ObjectId(userId),
        pendingEmail: { $exists: true, $ne: null },
    };

    const update = {
        $set: {
            email: "$pendingEmail",
            emailVerified: true,
        },
        $unset: {
            pendingEmail: "",
            pendingEmailToken: "",
            pendingEmailExpiresAt: "",
        },
    };

    /**
     * NOTE:
     * MongoDB does NOT allow field references like "$pendingEmail" in $set
     * directly in updateOne.
     * Therefore we must first read the pendingEmail OR use an aggregation pipeline update.
     */

    return db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        [
            {
                $set: {
                    email: "$pendingEmail",
                    emailVerified: true,
                },
            },
            {
                $unset: [
                    "pendingEmail",
                    "pendingEmailToken",
                    "pendingEmailExpiresAt",
                ],
            },
        ]
    );
};
