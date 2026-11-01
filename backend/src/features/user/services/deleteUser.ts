import model from '../models/index.js';
import { AppError } from '../../../types/errors.js';

export default async ({ userId }: { userId: string }) => {
    const result = await model.deleteUser({ userId });

    if (result.deletedCount === 0) {
        throw new AppError(404, "Fail to delete account.");
    }

    return {
        message: "Account has been deleted.",
    };
};
