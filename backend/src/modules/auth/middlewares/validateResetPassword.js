const { validatePassword } = require("../../../utils/password");

module.exports = (req, res, next) => {
    const { token, password } = req.body;

    if (typeof token !== "string" || !token.trim()) {
        return res.status(400).json({ message: "Token is required." });
    }

    if (typeof password !== "string" || !password) {
        return res.status(400).json({ message: "New password is required." });
    }

    const passwordError = validatePassword(password);

    if (passwordError) {
        return res.status(400).json({ message: passwordError });
    }

    req.body.token = token.trim();

    next();
};
