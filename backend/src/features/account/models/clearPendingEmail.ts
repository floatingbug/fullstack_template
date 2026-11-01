import { getDb, ObjectId } from '../../../db/mongo.js';
import type { UserDocument } from '../../../types/user.js';

export default async ({ userId }: { userId: string }) => {
    const db = getDb();

    return db.collection<UserDocument>("users").updateOne(
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
