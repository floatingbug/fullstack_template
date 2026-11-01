import type { NextFunction, Request, Response } from 'express';
import validator from 'validator';
import normalize from '../../../utils/normalize.js';

const { normalizeEmail, normalizeName, validateName } = normalize;

export default (req: Request, res: Response, next: NextFunction) => {
    const { nameOrEmail, password } = req.body;

    if (typeof nameOrEmail !== "string" || typeof password !== "string") {
        return res.status(400).json({ message: "Name or email and password are required" });
    }

    const identifier = nameOrEmail.trim();

    if (!identifier || !password) {
        return res.status(400).json({ message: "Name or email and password are required" });
    }

    // If input contains "@": treat as email (compared case-insensitively)
    if (identifier.includes("@")) {
        const normalizedEmail = normalizeEmail(identifier);

        if (!validator.isEmail(normalizedEmail)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        req.body.nameOrEmail = normalizedEmail;
    }
    else {
        const nameError = validateName(identifier);

        if (nameError) {
            return res.status(400).json({ message: nameError });
        }

        req.body.nameOrEmail = normalizeName(identifier);
    }

    // Passwords are compared exactly as entered; never trim them.
    req.body.password = password;

    next();
};
