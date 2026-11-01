import { getDb, ObjectId } from '../../../db/mongo.js';
import type { UserDocument } from '../../../types/user.js';

export default async ({
    userId,
    passwordResetTokenHash,
    passwordResetExpiresAt,
}: {
    userId: string;
    passwordResetTokenHash: string;
    passwordResetExpiresAt: Date;
}) => {
    const db = getDb();

    return db.collection<UserDocument>("users").updateOne(
        { _id: new ObjectId(userId) },
        {
            $set: {
                passwordResetTokenHash,
                passwordResetExpiresAt,
            },
        }
    );
};
