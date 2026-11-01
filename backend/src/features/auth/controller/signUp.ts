import catchAsync from '../../../utils/catchAsync.js';
import service from '../services/index.js';

export default catchAsync(async (req, res) => {
    const { name, email, password } = req.body;

    await service.signUp({ name, email, password });

    return res.status(201).json({
        message: "Sign up successful. Please check your email to verify your account.",
    });
});
