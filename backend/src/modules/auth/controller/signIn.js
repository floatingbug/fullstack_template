const catchAsync = require("../../../utils/catchAsync");
const service = require("../../auth/services");
const { REFRESH_TOKEN_COOKIE, refreshCookieOptions } = require("../../../utils/refreshCookie");

module.exports = catchAsync(async (req, res) => {
    const { nameOrEmail, password } = req.body;

    const result = await service.signIn({ nameOrEmail, password });

    // Refresh token only travels in the HttpOnly cookie, never in the JSON body.
    const { refreshToken, ...payload } = result;

    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshCookieOptions);

    res.status(200).json(payload);
});
