const router = require("express").Router();
const authUser = require("../../middlewares/authUser");
const validateUpdateAccount = require("./middlewares/validateUpdateAccount");
const controller = require("./controller");
const rateLimit = require('express-rate-limit');
const config = require("../../config");

const accountChangeLimiter = config.env === "production"
    ? rateLimit(config.rateLimitConfig.accountChange)
    : (req, res, next) => next();

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

module.exports = router;
