import { getDb, ObjectId } from '../../../db/mongo.js';
import type { UserDocument } from '../../../types/user.js';

export default async ({ userId }: { userId: string }) => {
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

    return db.collection<UserDocument>("users").updateOne(
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
