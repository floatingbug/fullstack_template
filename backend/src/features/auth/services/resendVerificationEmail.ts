import crypto from 'node:crypto';
import models from '../models/index.js';
import mailer from '../../../utils/mailer.js';
import normalize from '../../../utils/normalize.js';
import { AppError } from '../../../types/errors.js';

const { sendVerificationEmail } = mailer;
const { normalizeEmail } = normalize;

export default async ({ email }: { email: string }) => {
    const user = await models.findByEmail({ email: normalizeEmail(email) });

    if (!user || user.emailVerified) {
        return;
    }

    const emailToken = crypto.randomBytes(32).toString("hex");

    const emailTokenHash = crypto
        .createHash("sha256")
        .update(emailToken)
        .digest("hex");

    const emailTokenExpiresAt = new Date(
        Date.now() + 30 * 60 * 1000 // 30 minutes
    );

    const update = {
        emailTokenHash,
        emailTokenExpiresAt,
    };

    await models.updateById({
        id: String(user._id),
        update,
    });

    try {
        await sendVerificationEmail({
            email: user.email,
            token: emailToken,
        });
    }
    catch {
        throw new AppError(
            502,
            "Could not send the verification email. Please try again later.",
        );
    }

    return true;
};
