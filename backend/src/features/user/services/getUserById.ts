import model from '../models/index.js';
import { AppError } from '../../../types/errors.js';
import type { PublicUser } from '../../../types/user.js';

export default async ({ userId }: { userId: string }): Promise<PublicUser> => {
    const user = await model.findById({ userId });
    if (!user) throw new AppError(404, 'User not found');

    return { id: String(user._id), name: user.name, email: user.email };
};
