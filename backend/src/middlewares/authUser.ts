import type { NextFunction, Request, Response } from 'express';
import config from '../config/index.js';
import type { AuthPayload } from '../types/auth.js';
import { verifyToken } from '../utils/jwt.js';

export default (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;

    if (!header) {
        return res.status(401).json({ message: 'Missing authorization header' });
    }

    const token = header.split(' ')[1];

    try {
        const decoded = verifyToken(token as string, config.jwtAccessSecret);
        req.user = decoded as AuthPayload;
        return next();
    }
    catch {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
