import { getDb, ObjectId } from '../../../db/mongo.js';
import type { UserDocument } from '../../../types/user.js';

export default async ({ newName, userId }: { newName: string; userId: string }) => {
    const db = getDb();

    const result = await db.collection<UserDocument>("users").updateOne(
        {
            _id: new ObjectId(userId),
        },
        {
            $set: {
                name: newName,
            },
        },
    );

    return result;
};
