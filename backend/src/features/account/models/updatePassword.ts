import { getDb, ObjectId } from '../../../db/mongo.js';
import type { UserDocument } from '../../../types/user.js';

export default async ({ newPassword, userId }: { newPassword: string; userId: string }) => {
    const db = getDb();
    const filter = {
        _id: new ObjectId(userId),
    };
    const update = {
        $set: {
            password: newPassword,
        },
    };

    const result = await db.collection<UserDocument>("users").updateOne(filter, update);

    return result;
};
