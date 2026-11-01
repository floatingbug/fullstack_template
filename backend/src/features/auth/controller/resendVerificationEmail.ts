import catchAsync from '../../../utils/catchAsync.js';
import services from '../services/index.js';

export default catchAsync(async (req, res) => {
    await services.resendVerificationEmail({ email: req.body.email });

    res.json({
        message: "If an account exists, a verification email has been sent.",
    });
});
