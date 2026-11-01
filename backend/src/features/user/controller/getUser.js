const catchAsync = require("../../../utils/catchAsync");
const services = require("../services");

module.exports = catchAsync(async (req, res) => {
    const {id: userId} = req.user;

    const user = await services.getUserById({userId});

    res.json(user);
});
