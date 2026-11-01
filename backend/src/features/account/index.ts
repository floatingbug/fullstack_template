import express from 'express';
import type { RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import config from '../../config/index.js';
import authUser from '../../middlewares/authUser.js';
import validateUpdateAccount from './middlewares/validateUpdateAccount.js';
import controller from './controller/index.js';

const router = express.Router();

const allowAll: RequestHandler = (_req, _res, next) => next();

const accountChangeLimiter = config.env === "production"
    ? rateLimit(config.rateLimitConfig.accountChange)
    : allowAll;

router.patch(
    "/", 
    accountChangeLimiter, 
    authUser, 
    validateUpdateAccount, 
    controller.updateAccount
);

router.get(
    "/confirm-email", 
    controller.confirmEmailChange
);

export default router;
