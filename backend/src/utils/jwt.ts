import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import type { AuthPayload } from '../types/auth.js';

export function signToken(payload: AuthPayload, secret: string, expiresIn: string): Promise<string> {
    return new Promise((resolve, reject) => {
        jwt.sign(
            payload,
            secret,
            { expiresIn: expiresIn as SignOptions['expiresIn'] },
            (err, token) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(token as string);
                }
            },
        );
    });
}

export function verifyToken(token: string, secret: string): AuthPayload {
    return jwt.verify(token, secret) as AuthPayload;
}
