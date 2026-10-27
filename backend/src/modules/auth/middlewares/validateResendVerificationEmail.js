const validator = require("validator");
const { normalizeEmail } = require("../../../utils/normalize");

module.exports = (req, res, next) => {
    const { email } = req.body;

    if (typeof email !== "string") {
        return res.status(400).json({
            message: "Email is required",
        });
    }

    const normalizedEmail = normalizeEmail(email);

    if (!validator.isEmail(normalizedEmail)) {
        return res.status(400).json({
            message: "Invalid email format",
        });
    }

    req.body.email = normalizedEmail;

    next();
};
