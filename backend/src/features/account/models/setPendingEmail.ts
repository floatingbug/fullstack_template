import { getDb, ObjectId } from '../../../db/mongo.js';
import type { UserDocument } from '../../../types/user.js';

export default async ({
    userId,
    newEmail,
    hashedToken,
    expiresAt,
    emailChangeLastRequestedAt,
}: {
    userId: string;
    newEmail: string;
    hashedToken: string;
    expiresAt: Date;
    emailChangeLastRequestedAt?: Date | null;
}) => {
    const db = getDb();

    const result = await db.collection<UserDocument>("users").updateOne(
        { _id: new ObjectId(userId) },
        {
            $set: {
                pendingEmail: newEmail,
                pendingEmailToken: hashedToken,
                pendingEmailExpiresAt: expiresAt,
                emailChangeLastRequestedAt: emailChangeLastRequestedAt || new Date(),
            },
        }
    );

    return result;
};
