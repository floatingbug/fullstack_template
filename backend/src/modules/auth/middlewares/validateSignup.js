const validator = require("validator");
const { normalizeEmail, normalizeName, validateName } = require("../../../utils/normalize");
const { validatePassword } = require("../../../utils/password");

function validateSignUp(req, res, next) {
    const { name, email, password } = req.body;

    // Name
    if (typeof name !== "string" || validator.isEmpty(name.trim())) {
        return res.status(400).json({ message: "Name is required" });
    }

    const nameError = validateName(name);
    if (nameError) {
        return res.status(400).json({ message: nameError });
    }

    // Email
    if (typeof email !== "string") {
        return res.status(400).json({ message: "Invalid email" });
    }

    const normalizedEmail = normalizeEmail(email);

    if (!validator.isEmail(normalizedEmail)) {
        return res.status(400).json({ message: "Invalid email" });
    }

    // Password (never trimmed)
    const passwordError = validatePassword(password);
    if (passwordError) {
        return res.status(400).json({ message: passwordError });
    }

    // Store normalized values (emails are compared case-insensitively)
    req.body.name = normalizeName(name);
    req.body.email = normalizedEmail;

    next();
}

module.exports = validateSignUp;
