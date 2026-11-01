const crypto = require("crypto");
const model = require("../models");
const { sendVerificationEmail } = require("../../../utils/mailer");
const { hashPassword } = require("../../../utils/password");
const { normalizeEmail, normalizeName } = require("../../../utils/normalize");
const logger = require("../../../utils/logger");

module.exports = async ({ name, email, password }) => {
    const userName = normalizeName(name);
    const userEmail = normalizeEmail(email);

    const existing = await model.findByNameOrEmail({
        name: userName,
        email: userEmail,
    });

    if (existing) {
        throw {
            status: 409,
            message: "Name or e-mail already exists",
        };
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
        if (err.code === 11000) {
            throw {
                status: 409,
                message: "Name or e-mail already exists",
            };
        }

        throw err;
    }

    if (!result.acknowledged) {
        throw {
            status: 500,
            message: "Failed to create user",
        };
    }

    try {
        await sendVerificationEmail({
            email: userEmail,
            token: emailToken,
        });
    }
    catch (err) {
        // Compensate: do not leave a user behind whose verification mail failed.
        try {
            await model.deleteById({ userId: result.insertedId });
        }
        catch (cleanupErr) {
            logger.error(
                { err: cleanupErr, userId: result.insertedId },
                "Failed to roll back user after mail error"
            );
        }

        throw {
            status: 502,
            message: "Could not send the verification email. Please try again later.",
        };
    }

    return true;
};
