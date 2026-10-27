const service = require("../services");
const catchAsync = require("../../../utils/catchAsync");
const { clearRefreshCookie } = require("../../../utils/refreshCookie");


module.exports = catchAsync(async (req, res) => {
    const result = await service.deleteUser({userId: req.user.id});

    clearRefreshCookie(res);

    return res.json(result);
});
