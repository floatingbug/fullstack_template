import catchAsync from '../../../utils/catchAsync.js';
import services from '../services/index.js';
import { AppError } from '../../../types/errors.js';

export default catchAsync(async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
        throw new AppError(400, "Token and new password are required.");
    }

    const result = await services.resetPassword({
        token,
        password,
    });

    res.json(result);
});
