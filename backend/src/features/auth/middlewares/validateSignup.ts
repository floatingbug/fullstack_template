import type { NextFunction, Request, Response } from 'express';
import validator from 'validator';
import normalize from '../../../utils/normalize.js';
import password from '../../../utils/password.js';

const { normalizeEmail, normalizeName, validateName } = normalize;
const { validatePassword } = password;

function validateSignUp(req: Request, res: Response, next: NextFunction) {
    const { name, email, password } = req.body;

    // Name
    if (typeof name !== "string" || validator.isEmpty(name.trim())) {
        return res.status(400).json({ message: "Name is required" });
    }

    const nameError = validateName(name);
    if (nameError) {
        return res.status(400).json({ message: nameError });
    }

    // Email
    if (typeof email !== "string") {
        return res.status(400).json({ message: "Invalid email" });
    }

    const normalizedEmail = normalizeEmail(email);

    if (!validator.isEmail(normalizedEmail)) {
        return res.status(400).json({ message: "Invalid email" });
    }

    // Password (never trimmed)
    const passwordError = validatePassword(password);
    if (passwordError) {
        return res.status(400).json({ message: passwordError });
    }

    // Store normalized values (emails are compared case-insensitively)
    req.body.name = normalizeName(name);
    req.body.email = normalizedEmail;

    next();
}

export default validateSignUp;
