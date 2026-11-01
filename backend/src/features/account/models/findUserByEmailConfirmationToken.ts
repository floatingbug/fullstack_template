import { getDb } from '../../../db/mongo.js';
import type { UserDocument } from '../../../types/user.js';

export default async ({ hashedToken }: { hashedToken: string }) => {
    const db = getDb();
    const filter = { pendingEmailToken: hashedToken };

    const result = await db.collection<UserDocument>("users").findOne(filter);

    return result;
};
