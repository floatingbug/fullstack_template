import bcrypt from 'bcrypt';
import config from '../config/index.js';

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

/**
 * Prüft ein Passwort gegen die gemeinsame Policy.
 * Gibt eine Fehlermeldung zurück oder null.
 *
 * Passwörter werden niemals getrimmt: Leerzeichen sind Teil des Passworts.
 */
function validatePassword(password: unknown): string | null {
    if (typeof password !== "string") {
        return "Password must be a string";
    }

    if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
        return `Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters long`;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
        return "Password must include uppercase, lowercase, and at least one number";
    }

    return null;
}

function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, config.bcryptSaltRounds);
}

function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export default {
    PASSWORD_MIN_LENGTH,
    PASSWORD_MAX_LENGTH,
    validatePassword,
    hashPassword,
    comparePassword,
};
