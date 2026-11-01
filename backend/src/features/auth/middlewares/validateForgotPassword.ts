import type { NextFunction, Request, Response } from 'express';
import validator from 'validator';
import normalize from '../../../utils/normalize.js';

const { normalizeEmail } = normalize;

export default (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    if (typeof email !== "string") {
        return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = normalizeEmail(email);

    if (!validator.isEmail(normalizedEmail)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    req.body.email = normalizedEmail;

    next();
};
