import crypto from 'node:crypto';
import models from '../models/index.js';
import logger from '../../../utils/logger.js';
import { AppError, isDuplicateKeyError } from '../../../types/errors.js';

export default async ({ token }: { token: string | undefined }) => {
    if (!token) {
        throw new AppError(400, "Confirmation token is required.");
    }

    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const user = await models.findUserByEmailConfirmationToken({
        hashedToken,
    });

    if (!user) {
        throw new AppError(400, "Invalid or expired confirmation token.");
    }

    if (!user.pendingEmailExpiresAt || user.pendingEmailExpiresAt < new Date()) {
        throw new AppError(400, "Confirmation token has expired.");
    }

    let result;

    try {
        result = await models.confirmPendingEmailChange({
            userId: String(user._id),
        });
    }
    catch (err) {
        // Unique index on email: another account claimed the address in the meantime.
        if (isDuplicateKeyError(err)) {
            try {
                await models.clearPendingEmail({ userId: String(user._id) });
            }
            catch (cleanupErr) {
                logger.error(
                    { err: cleanupErr, userId: user._id },
                    "Failed to clear pending email after duplicate key"
                );
            }

            throw new AppError(409, "This email address is already in use.");
        }

        throw err;
    }

    if (result.modifiedCount === 0) {
        throw new AppError(500, "Email change could not be confirmed.");
    }

    return {
        success: true,
        newEmail: user.pendingEmail,
        message: "Email address has been successfully updated.",
    };
};
