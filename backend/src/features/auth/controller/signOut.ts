import catchAsync from '../../../utils/catchAsync.js';
import refreshCookie from '../../../utils/refreshCookie.js';

const { clearRefreshCookie } = refreshCookie;

export default catchAsync(async (_req, res) => {
    clearRefreshCookie(res);

    return res.status(204).end();
});
