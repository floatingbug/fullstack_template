const catchAsync = require("../../../utils/catchAsync");
const services = require("../services");


module.exports = catchAsync(async (req, res, next) => {
    const token = req.query.token;

    const result = await services.confirmEmailChange({token});

    res.json(result);
});
