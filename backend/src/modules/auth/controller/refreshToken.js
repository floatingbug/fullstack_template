const catchAsync = require('../../../utils/catchAsync');
const service = require('../services');

module.exports = catchAsync(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;

    const result = await service.refreshToken({ refreshToken });

    return res.json(result);
});

