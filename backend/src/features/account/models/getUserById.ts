import { getDb, ObjectId } from '../../../db/mongo.js';
import type { UserDocument } from '../../../types/user.js';

export default async ({ userId }: { userId: string }) => {
    const db = getDb();
    const filter = { _id: new ObjectId(userId) };

    const user = await db.collection<UserDocument>("users").findOne(filter);

    return user;
};
