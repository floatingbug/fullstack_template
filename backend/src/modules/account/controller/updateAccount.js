const catchAsync = require("../../../utils/catchAsync");
const services = require("../services");

module.exports = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const changes = req.body;

    const result = await services.updateAccount({userId, changes});

    res.json(result);
});
