import express from 'express';
import type { RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import config from '../../config/index.js';
import authUser from '../../middlewares/authUser.js';
import { openApiMiddleware } from '../../middlewares/openapi.js';
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
    ...openApiMiddleware,
    controller.signUp
);
router.post(
    '/sign-in', 
    authLimiter, 
    validateLogin, 
    ...openApiMiddleware,
    controller.signIn
);
router.post(
    "/sign-out",
    authUser,
    ...openApiMiddleware,
    controller.signOut
);
router.post(
    '/refresh', 
    validateRefreshToken, 
    ...openApiMiddleware,
    controller.refreshToken
);
router.get(
    '/verify-email', 
    ...openApiMiddleware,
    controller.verifyEmail
);
router.post(
    '/verify-email/resend', 
    resendLimiter,
    validateResendVerificationEmail, 
    ...openApiMiddleware,
    controller.resendVerificationEmail
);
router.post(
    "/forgot-password",
    forgotPasswordLimiter,
    validateForgotPassword,
    ...openApiMiddleware,
    controller.forgotPassword
);
router.post(
    "/reset-password",
    validateResetPassword,
    ...openApiMiddleware,
    controller.resetPassword
);



export default router;
