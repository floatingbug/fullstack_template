import { getDb, ObjectId } from '../../../db/mongo.js';
import type { UserDocument } from '../../../types/user.js';

export default async ({ userId, hashedPassword }: { userId: string; hashedPassword: string }) => {
    const db = getDb();

    return db.collection<UserDocument>("users").updateOne(
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
