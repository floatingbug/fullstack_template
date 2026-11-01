import dotenv from 'dotenv';
import helmetConfig from './helmetConfig.js';
import rateLimitConfig from './rateLimitConfig.js';
import corsConfig from './corsConfig.js';
import coolDownConfig from './coolDownConfig.js';
import authConfig from './authConfig.js';

dotenv.config();

const env = process.env.NODE_ENV || 'development';

const config = {
    env,
    port: process.env.PORT || 3000,

    // Database
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017',
    dbName: process.env.DB_NAME || 'appdb',

    // JWT
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'change_this',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'change_this_too',
    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '1h',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',

    // Hashing
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '', 10) || 12,

    // Body parsing limits
    jsonConfig: { limit: "10kb" },
    urlencodedConfig: { limit: "10kb", extended: true },

    // SMTP + Email Verification
    smtpHost: process.env.SMTP_HOST,
    smtpPort: parseInt(process.env.SMTP_PORT ?? '', 10) || 587,
    smtpSecure: process.env.SMTP_SECURE === "true", // "true" | "false"
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    mailFrom: process.env.MAIL_FROM || "No Reply <no-reply@example.com>",

    // Frontend base URL for links (email verification)
    clientBaseUrl: process.env.CLIENT_BASE_URL || "http://localhost:5173",

    // Security configs
    helmetConfig,
    rateLimitConfig,
    corsConfig,
    coolDownConfig,
    authConfig,
};

export type Config = typeof config;

export default config;
