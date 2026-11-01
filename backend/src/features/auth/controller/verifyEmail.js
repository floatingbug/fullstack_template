const verifyEmail = require("../services/verifyEmail");
const catchAsync = require("../../../utils/catchAsync");

module.exports = catchAsync(async (req, res) => {
    const {token} = req.query;

    if (!token) {
        return res.status(400).json({ message: "Token is required" });
    }

    await verifyEmail({token});

    res.json({ message: "Email verified successfully" });
});
