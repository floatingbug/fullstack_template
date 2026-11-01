import crypto from 'node:crypto';
import models from '../models/index.js';
import password from '../../../utils/password.js';
import { AppError } from '../../../types/errors.js';

const { validatePassword, hashPassword } = password;

export default async ({ token, password }: { token: string; password: string }) => {
    const passwordError = validatePassword(password);

    if (passwordError) {
        throw new AppError(400, passwordError);
    }

    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const user = await models.findUserByPasswordResetToken({
        hashedToken,
    });

    if (!user) {
        throw new AppError(400, "Invalid or expired password reset token.");
    }

    if (user.passwordResetExpiresAt != null && user.passwordResetExpiresAt < new Date()) {
        throw new AppError(400, "Password reset token has expired.");
    }

    const hashedPassword = await hashPassword(password);

    const result = await models.resetPassword({
        userId: String(user._id),
        hashedPassword,
    });

    if (result.modifiedCount === 0) {
        throw new AppError(500, "Failed to reset password.");
    }

    return {
        message: "Password has been reset successfully.",
    };
};
