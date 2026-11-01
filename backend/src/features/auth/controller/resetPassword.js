const catchAsync = require("../../../utils/catchAsync");
const services = require("../services");

module.exports = catchAsync(async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
        throw {
            status: 400,
            message: "Token and new password are required.",
        };
    }

    const result = await services.resetPassword({
        token,
        password,
    });

    res.json(result);
});
