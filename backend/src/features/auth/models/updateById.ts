import { ObjectId } from 'mongodb';
import type { UpdateFilter } from 'mongodb';
import { getDb } from '../../../db/mongo.js';
import type { UserDocument } from '../../../types/user.js';

export default async ({ id, update }: { id: string; update: UpdateFilter<UserDocument>['$set'] }) => {
    const db = getDb();

    return db
        .collection<UserDocument>('users')
        .updateOne({ _id: new ObjectId(id) }, { $set: update });
};
