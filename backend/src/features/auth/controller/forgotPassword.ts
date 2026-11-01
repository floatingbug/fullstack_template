import catchAsync from '../../../utils/catchAsync.js';
import services from '../services/index.js';
import { AppError } from '../../../types/errors.js';

export default catchAsync(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new AppError(400, "Email is required");
    }

    await services.forgotPassword({ email });

    return res.json({
        message: "If an account with this email exists, a password reset link has been sent.",
    });
});
