import catchAsync from '../../../utils/catchAsync.js';
import service from '../../auth/services/index.js';
import refreshCookie from '../../../utils/refreshCookie.js';

const { REFRESH_TOKEN_COOKIE, refreshCookieOptions } = refreshCookie;

export default catchAsync(async (req, res) => {
    const { nameOrEmail, password } = req.body;

    const result = await service.signIn({ nameOrEmail, password });

    // Refresh token only travels in the HttpOnly cookie, never in the JSON body.
    const { refreshToken, ...payload } = result;

    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshCookieOptions);

    res.status(200).json(payload);
});
