const catchAsync = require("../../../utils/catchAsync");
const services = require("../services");

module.exports = catchAsync(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        const err = new Error("Email is required");
        err.status = 400;
        throw err;
    }

    await services.forgotPassword({ email });

    return res.json({
        message: "If an account with this email exists, a password reset link has been sent.",
    });
});

