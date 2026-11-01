import { getDb, ObjectId } from '../../../db/mongo.js';
import type { UserDocument } from '../../../types/user.js';

export default async ({ userId }: { userId: string }) => {
    if (!userId || !ObjectId.isValid(userId)) {
        return null;
    }

    const db = getDb();

    return db.collection<UserDocument>('users').findOne({ _id: new ObjectId(userId) });
};
