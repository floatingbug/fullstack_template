const validator = require("validator");
const { normalizeEmail, normalizeName, validateName } = require("../../../utils/normalize");
const { validatePassword } = require("../../../utils/password");

module.exports = async (req, res, next) => {
	const changes = req.body;

	// Must be a plain object
	if (
		!changes
		|| typeof changes !== "object"
		|| Array.isArray(changes)
	) {
		return res.status(400).json({
			error: "Invalid changes payload",
		});
	}

	const allowedKeys = ["name", "email", "password"];
	const keys = Object.keys(changes);

	// At least one change required
	if (keys.length === 0) {
		return res.status(400).json({
			error: "No changes provided",
		});
	}

	// Reject unknown fields
	for (const key of keys) {
		if (!allowedKeys.includes(key)) {
			return res.status(400).json({
				error: `Field '${key}' is not allowed`,
			});
		}
	}

	// NAME
	if ("name" in changes) {
		const nameError = validateName(changes.name);

		if (nameError) {
			return res.status(400).json({
				error: nameError,
			});
		}

		changes.name = normalizeName(changes.name);
	}

	// EMAIL
	if ("email" in changes) {
		if (typeof changes.email !== "string") {
			return res.status(400).json({
				error: "Email must be a string",
			});
		}

		const normalizedEmail = normalizeEmail(changes.email);

		if (!validator.isEmail(normalizedEmail)) {
			return res.status(400).json({
				error: "Invalid email address",
			});
		}

		changes.email = normalizedEmail;
	}

	// PASSWORD
	if ("password" in changes) {
		if (typeof changes.password !== "string") {
			return res.status(400).json({
				error: 
                {
                    type: "password",
                    message: "Password must be of type string.",
                }
			});
		}

		const passwordError = validatePassword(changes.password);

		if (passwordError) {
			return res.status(400).json({
				error: 
                {
                    type: "password",
                    message: passwordError,
                }
			});
		}
	}

	next();
};
