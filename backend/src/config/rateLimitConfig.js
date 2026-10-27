module.exports = {
    global: {
        windowMs: 60 * 1000, // 1 minute
        max: 200,            // limit each IP to 200 requests per windowMs
        message: 'Too many requests from this IP, please try again later.'
    },
    auth: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5,                   // limit each IP to 5 requests per windowMs
        message: 'Too many login attempts, please try again later.'
    },
    emailResend: {
        windowMs: 15 * 60 * 1000,
        max: 3,
        message: 'Too many verification emails requested. Please check your inbox.'
    },
    accountChange: {
		windowMs: 15 * 60 * 1000,
		max: 10,
		message: "Too many account update requests. Please try again later.",
	},
	confirmEmail: {
		windowMs: 15 * 60 * 1000,
		max: 5,
		message: "Too many email confirmation attempts. Please try again later.",
	},
    forgotPassword: {
        windowMs: 15 * 60 * 1000,
        max: 5,
        message: "Too many password reset requests. Please try again later.",
    },
};
