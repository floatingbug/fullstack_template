import verifyEmail from '../services/verifyEmail.js';
import catchAsync from '../../../utils/catchAsync.js';

export default catchAsync(async (req, res) => {
    const token = req.query.token as string | undefined;

    if (!token) {
        return res.status(400).json({ message: "Token is required" });
    }

    await verifyEmail({ token });

    res.json({ message: "Email verified successfully" });
});
