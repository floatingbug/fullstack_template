import type { NextFunction, Request, Response } from 'express';
import password from '../../../utils/password.js';

const { validatePassword } = password;

export default (req: Request, res: Response, next: NextFunction) => {
    const { token, password } = req.body;

    if (typeof token !== "string" || !token.trim()) {
        return res.status(400).json({ message: "Token is required." });
    }

    if (typeof password !== "string" || !password) {
        return res.status(400).json({ message: "New password is required." });
    }

    const passwordError = validatePassword(password);

    if (passwordError) {
        return res.status(400).json({ message: passwordError });
    }

    req.body.token = token.trim();

    next();
};
