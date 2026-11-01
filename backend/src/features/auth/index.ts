import express from 'express';
import type { RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import config from '../../config/index.js';
import authUser from '../../middlewares/authUser.js';
import controller from './controller/index.js';
import validateSignup from './middlewares/validateSignup.js';
import validateLogin from './middlewares/validateLogin.js';
import validateRefreshToken from './middlewares/validateRefreshToken.js';
import validateResendVerificationEmail from './middlewares/validateResendVerificationEmail.js';
import validateForgotPassword from './middlewares/validateForgotPassword.js';
import validateResetPassword from './middlewares/validateResetPassword.js';

const router = express.Router();

const allowAll: RequestHandler = (_req, _res, next) => next();

const authLimiter = config.env === "production"
    ? rateLimit(config.rateLimitConfig.auth)
    : allowAll;

const resendLimiter = config.env === "production"
    ? rateLimit(config.rateLimitConfig.emailResend)
    : allowAll;

const forgotPasswordLimiter = config.env === "production"
    ? rateLimit(config.rateLimitConfig.forgotPassword)
    : allowAll;


router.post(
    '/sign-up', 
    authLimiter, 
    validateSignup, 
    controller.signUp
);
router.post(
    '/sign-in', 
    authLimiter, 
    validateLogin, 
    controller.signIn
);
router.post(
    "/sign-out",
    authUser,
    controller.signOut
);
router.post(
    '/refresh', 
    validateRefreshToken, 
    controller.refreshToken
);
router.get(
    '/verify-email', 
    controller.verifyEmail
);
router.post(
    '/verify-email/resend', 
    resendLimiter,
    validateResendVerificationEmail, 
    controller.resendVerificationEmail
);
router.post(
    "/forgot-password",
    forgotPasswordLimiter,
    validateForgotPassword,
    controller.forgotPassword
);
router.post(
    "/reset-password",
    validateResetPassword,
    controller.resetPassword
);



export default router;
