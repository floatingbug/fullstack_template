const {getDb, ObjectId} = require("../../../db/mongo");

module.exports = async ({userId, newEmail, hashedToken, expiresAt, emailChangeLastRequestedAt}) => {
    const db = getDb();

    const result = await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        {
            $set: {
                pendingEmail: newEmail,
                pendingEmailToken: hashedToken,
                pendingEmailExpiresAt: expiresAt,
                emailChangeLastRequestedAt: emailChangeLastRequestedAt || new Date(),
            }
        }
    );

    return result;
}
