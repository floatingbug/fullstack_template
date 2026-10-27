const crypto = require("crypto");
const models = require("../models");
const config = require("../../../config");
const { sendPasswordResetEmail } = require("../../../utils/mailer");
const { normalizeEmail } = require("../../../utils/normalize");
const logger = require("../../../utils/logger");

module.exports = async ({ email }) => {
    const normalizedEmail = normalizeEmail(email);
    const user = await models.findByEmail({ email: normalizedEmail });

    if (!user) return;

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

    const expiresAt = new Date(
        Date.now() + config.authConfig.passwordResetExpiresIn
    );

    await models.setPasswordResetToken({
        userId: user._id,
        passwordResetTokenHash: hashedToken,
        passwordResetExpiresAt: expiresAt,
    });

    try {
        await sendPasswordResetEmail({
            email: normalizedEmail,
            token: rawToken,
        });
    }
    catch (err) {
        // Stay generic to avoid account enumeration; the mailer already logged the error.
        logger.error(
            { err, email: normalizedEmail },
            "Password reset mail could not be sent"
        );
    }
};
