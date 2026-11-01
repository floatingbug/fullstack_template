import type { NextFunction, Request, Response } from 'express';
import validator from 'validator';
import normalize from '../../../utils/normalize.js';
import password from '../../../utils/password.js';

const { normalizeEmail, normalizeName, validateName } = normalize;
const { validatePassword } = password;

export default (req: Request, res: Response, next: NextFunction) => {
    const changes = req.body as Record<string, unknown>;

    // Must be a plain object
    if (
        !changes
        || typeof changes !== "object"
        || Array.isArray(changes)
    ) {
        return res.status(400).json({
            message: "Invalid changes payload",
        });
    }

    const allowedKeys = ["name", "email", "password"];
    const keys = Object.keys(changes);

    // At least one change required
    if (keys.length === 0) {
        return res.status(400).json({
            message: "No changes provided",
        });
    }

    // Reject unknown fields
    for (const key of keys) {
        if (!allowedKeys.includes(key)) {
            return res.status(400).json({
                message: `Field '${key}' is not allowed`,
            });
        }
    }

    // NAME
    if ("name" in changes) {
        const nameError = validateName(changes.name);

        if (nameError) {
            return res.status(400).json({
                message: nameError,
            });
        }

        changes.name = normalizeName(changes.name);
    }

    // EMAIL
    if ("email" in changes) {
        if (typeof changes.email !== "string") {
            return res.status(400).json({
                message: "Email must be a string",
            });
        }

        const normalizedEmail = normalizeEmail(changes.email);

        if (!validator.isEmail(normalizedEmail)) {
            return res.status(400).json({
                message: "Invalid email address",
            });
        }

        changes.email = normalizedEmail;
    }

    // PASSWORD
    if ("password" in changes) {
        if (typeof changes.password !== "string") {
            return res.status(400).json({
                message: "Password must be of type string.",
            });
        }

        const passwordError = validatePassword(changes.password);

        if (passwordError) {
            return res.status(400).json({
                message: passwordError,
            });
        }
    }

    next();
};
