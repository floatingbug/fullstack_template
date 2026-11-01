import { getDb } from '../../../db/mongo.js';
import type { UserDocument } from '../../../types/user.js';

export default async ({ name, email }: { name: string; email: string }) => {
    const db = getDb();
    const filter = {
        $or: [
            { name },
            { email },
        ],
    };

    return db.collection<UserDocument>("users").findOne(filter);
};
