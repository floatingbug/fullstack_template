import type { CookieOptions, Response } from 'express';
import config from '../config/index.js';

const REFRESH_TOKEN_COOKIE = 'refreshToken';
const REFRESH_TOKEN_PATH = '/auth/refresh';

const DEFAULT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// Supports "7d", "1h", "30m", "45s" and plain numbers (milliseconds).
function parseDuration(value: unknown, fallbackMs: number): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value !== 'string') {
        return fallbackMs;
    }

    const match = value.trim().match(/^(\d+)\s*(ms|s|m|h|d)?$/i);

    if (!match) {
        return fallbackMs;
    }

    const amount = parseInt(match[1] ?? '0', 10);
    const unit = (match[2] || 'ms').toLowerCase();
    const factors: Record<string, number> = {
        ms: 1,
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    };

    return amount * factors[unit]!;
}

const isProduction = config.env === 'production';

// HttpOnly must always be enabled: the token is never readable from JavaScript.
// `secure`/`sameSite: "none"` require HTTPS, so development falls back to "lax".
const refreshCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: REFRESH_TOKEN_PATH,
    maxAge: parseDuration(config.refreshTokenExpiresIn, DEFAULT_MAX_AGE_MS),
};

function clearRefreshCookie(res: Response): void {
    res.clearCookie(REFRESH_TOKEN_COOKIE, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: REFRESH_TOKEN_PATH,
    });
}

export default {
    REFRESH_TOKEN_COOKIE,
    REFRESH_TOKEN_PATH,
    refreshCookieOptions,
    clearRefreshCookie,
};
