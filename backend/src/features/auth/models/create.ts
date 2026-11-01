import { getDb } from '../../../db/mongo.js';
import type { NewUser, UserDocument } from '../../../types/user.js';

export default async ({ user }: { user: NewUser }) => {
    const db = getDb();

    return db.collection<UserDocument>('users').insertOne(user);
};
