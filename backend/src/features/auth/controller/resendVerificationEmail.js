const catchAsync = require("../../../utils/catchAsync");
const services = require("../services");


module.exports = catchAsync(async (req, res) => {
    await services.resendVerificationEmail({email: req.body.email});

    res.json({
        message: "If an account exists, a verification email has been sent."
    });
});
