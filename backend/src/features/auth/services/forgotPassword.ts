import crypto from 'node:crypto';
import models from '../models/index.js';
import config from '../../../config/index.js';
import mailer from '../../../utils/mailer.js';
import normalize from '../../../utils/normalize.js';
import logger from '../../../utils/logger.js';

const { sendPasswordResetEmail } = mailer;
const { normalizeEmail } = normalize;

export default async ({ email }: { email: string }) => {
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
        userId: String(user._id),
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
