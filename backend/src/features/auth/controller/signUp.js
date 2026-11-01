const catchAsync = require('../../../utils/catchAsync');
const service = require('../services');

module.exports = catchAsync(async (req, res) => {
    const { name, email, password } = req.body;

    const result = await service.signUp({ name, email, password });

    return res.status(201).json({
        message: "Sign up successful. Please check your email to verify your account.",
    });
});
