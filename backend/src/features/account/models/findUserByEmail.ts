import { getDb } from '../../../db/mongo.js';
import type { UserDocument } from '../../../types/user.js';

export default async ({ email }: { email: string }) => {
    const db = getDb();

    return db.collection<UserDocument>("users").findOne({ email });
};
