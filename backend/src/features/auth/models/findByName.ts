import { getDb } from '../../../db/mongo.js';
import type { UserDocument } from '../../../types/user.js';

export default async ({ name }: { name: string }) => {
    const db = getDb();

    return await db.collection<UserDocument>("users").findOne({ name });
};
