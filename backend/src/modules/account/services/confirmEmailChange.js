const crypto = require("crypto");
const models = require("../models");
const logger = require("../../../utils/logger");

module.exports = async ({ token }) => {
    if (!token) {
        throw {
            status: 400,
            message: "Confirmation token is required.",
        };
    }

    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const user = await models.findUserByEmailConfirmationToken({
        hashedToken,
    });

    if (!user) {
        throw {
            status: 400,
            message: "Invalid or expired confirmation token.",
        };
    }

    if (!user.pendingEmailExpiresAt || user.pendingEmailExpiresAt < new Date()) {
        throw {
            status: 400,
            message: "Confirmation token has expired.",
        };
    }

    let result;

    try {
        result = await models.confirmPendingEmailChange({
            userId: user._id,
        });
    }
    catch (err) {
        // Unique index on email: another account claimed the address in the meantime.
        if (err.code === 11000) {
            try {
                await models.clearPendingEmail({ userId: user._id });
            }
            catch (cleanupErr) {
                logger.error(
                    { err: cleanupErr, userId: user._id },
                    "Failed to clear pending email after duplicate key"
                );
            }

            throw {
                status: 409,
                message: "This email address is already in use.",
            };
        }

        throw err;
    }

    if (result.modifiedCount === 0) {
        throw {
            status: 500,
            message: "Email change could not be confirmed.",
        };
    }

    return {
        success: true,
        newEmail: user.pendingEmail,
        message: "Email address has been successfully updated.",
    };
};
