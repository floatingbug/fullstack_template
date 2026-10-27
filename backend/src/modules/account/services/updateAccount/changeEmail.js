const crypto = require("crypto");
const models = require("../../models");
const config = require("../../../../config");
const { sendEmailChangeEmail } = require("../../../../utils/mailer");
const { normalizeEmail } = require("../../../../utils/normalize");
const logger = require("../../../../utils/logger");

module.exports = async ({ userId, email }) => {
    const user = await models.getUserById({ userId });

    if (!user) {
        return {
            success: false,
            message: "User not found.",
        };
    }

    const newEmail = normalizeEmail(email);

    if (newEmail === normalizeEmail(user.email)) {
        return {
            success: false,
            message: "New email must differ from the current email.",
        };
    }

    // Emails are unique across users, so a change must not steal another account's address.
    const existing = await models.findUserByEmail({ email: newEmail });

    if (existing && String(existing._id) !== String(user._id)) {
        return {
            success: false,
            message: "This email address is already in use.",
        };
    }

    if (config.env === "production" && user.emailChangeLastRequestedAt) {
        const elapsedTime =
            Date.now() - new Date(user.emailChangeLastRequestedAt).getTime();

        if (elapsedTime < config.coolDownConfig.changeEmail.cooldown) {
            return {
                success: false,
                message: "Too many email change requests. Please try again later.",
            };
        }
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
    const emailChangeLastRequestedAt = new Date();

    const result = await models.setPendingEmail({
        userId,
        newEmail,
        hashedToken,
        expiresAt,
        emailChangeLastRequestedAt,
    });

    if (result.modifiedCount === 0) {
        return {
            success: false,
            message: "Could not initiate email change.",
        };
    }

    try {
        await sendEmailChangeEmail({
            email: newEmail,
            token: rawToken,
        });
    }
    catch (err) {
        // Roll back the pending change so the user can retry immediately.
        try {
            await models.clearPendingEmail({ userId });
        }
        catch (cleanupErr) {
            logger.error(
                { err: cleanupErr, userId },
                "Failed to roll back pending email change"
            );
        }

        return {
            success: false,
            message: "Could not send the confirmation email. Please try again later.",
        };
    }

    return {
        success: true,
        message: "Confirmation for the new email has been sent.",
    };
};
