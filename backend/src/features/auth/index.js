const { Router } = require('express');
const controller = require('./controller');
const validateSignup = require('./middlewares/validateSignup');
const validateLogin = require('./middlewares/validateLogin');
const validateRefreshToken = require('./middlewares/validateRefreshToken');
const validateResendVerificationEmail = require("./middlewares/validateResendVerificationEmail");
const validateForgotPassword = require("./middlewares/validateForgotPassword");
const validateResetPassword = require("./middlewares/validateResetPassword");
const rateLimit = require('express-rate-limit');
const config = require('../../config');
const router = Router();
const authUser = require("../../middlewares/authUser");

const authLimiter = config.env === "production"
    ? rateLimit(config.rateLimitConfig.auth)
    : (req, res, next) => next();

const resendLimiter = config.env === "production"
    ? rateLimit(config.rateLimitConfig.emailResend)
    : (req, res, next) => next();

const forgotPasswordLimiter = config.env === "production"
    ? rateLimit(config.rateLimitConfig.forgotPassword)
    : (req, res, next) => next();


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



module.exports = router;
