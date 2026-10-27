const catchAsync = require("../../../utils/catchAsync");
const { clearRefreshCookie } = require("../../../utils/refreshCookie");


module.exports = catchAsync(async (req, res) => {
    clearRefreshCookie(res);

    return res.status(204).end();
});
