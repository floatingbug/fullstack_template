import crypto from 'node:crypto';
import model from '../models/index.js';
import mailer from '../../../utils/mailer.js';
import password from '../../../utils/password.js';
import normalize from '../../../utils/normalize.js';
import logger from '../../../utils/logger.js';
import { AppError, isDuplicateKeyError } from '../../../types/errors.js';

const { sendVerificationEmail } = mailer;
const { hashPassword } = password;
const { normalizeEmail, normalizeName } = normalize;

export default async ({ name, email, password }: { name: string; email: string; password: string }) => {
    const userName = normalizeName(name);
    const userEmail = normalizeEmail(email);

    const existing = await model.findByNameOrEmail({
        name: userName,
        email: userEmail,
    });

    if (existing) {
        throw new AppError(409, "Name or e-mail already exists");
    }

    const passwordHash = await hashPassword(password);

    // Generate email verification token
    const emailToken = crypto.randomBytes(32).toString("hex");
    const emailTokenHash = crypto
        .createHash("sha256")
        .update(emailToken)
        .digest("hex");

    const emailTokenExpiresAt = new Date(
        Date.now() + 30 * 60 * 1000 // 30 minutes
    );

    const user = {
        name: userName,
        email: userEmail,
        pendingEmail: null,
        pendingEmailToken: null,
        pendingEmailExpiresAt: null,
        password: passwordHash,
        emailVerified: false,
        emailTokenHash,
        emailTokenExpiresAt,
        createdAt: new Date(),
    };

    let result;

    try {
        result = await model.create({ user });
    }
    catch (err) {
        // Unique indexes may reject a concurrent signup even if the pre-check passed.
        if (isDuplicateKeyError(err)) {
            throw new AppError(409, "Name or e-mail already exists");
        }

        throw err;
    }

    if (!result.acknowledged) {
        throw new AppError(500, "Failed to create user");
    }

    try {
        await sendVerificationEmail({
            email: userEmail,
            token: emailToken,
        });
    }
    catch {
        // Compensate: do not leave a user behind whose verification mail failed.
        try {
            await model.deleteById({ userId: String(result.insertedId) });
        }
        catch (cleanupErr) {
            logger.error(
                { err: cleanupErr, userId: result.insertedId },
                "Failed to roll back user after mail error"
            );
        }

        throw new AppError(
            502,
            "Could not send the verification email. Please try again later.",
        );
    }

    return true;
};
