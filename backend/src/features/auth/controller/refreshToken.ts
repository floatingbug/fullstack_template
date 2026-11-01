import catchAsync from '../../../utils/catchAsync.js';
import service from '../services/index.js';

export default catchAsync(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;

    const result = await service.refreshToken({ refreshToken });

    return res.json(result);
});
