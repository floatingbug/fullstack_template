import service from '../services/index.js';
import catchAsync from '../../../utils/catchAsync.js';
import refreshCookie from '../../../utils/refreshCookie.js';

const { clearRefreshCookie } = refreshCookie;

export default catchAsync(async (req, res) => {
    const result = await service.deleteUser({ userId: req.user!.id });

    clearRefreshCookie(res);

    return res.json(result);
});
