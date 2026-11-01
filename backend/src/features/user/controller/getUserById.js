const catchAsync = require('../../../utils/catchAsync');
const service = require('../services');

module.exports = catchAsync(async (req, res) => {
    const {id: userId} = req.params;

    const result = await service.getUserById({userId});

    return res.json(result);
});
