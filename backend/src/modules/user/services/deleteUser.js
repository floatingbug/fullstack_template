const model = require("../models");

module.exports = async ({ userId }) => {
    const result = await model.deleteUser({ userId });

    if (result.deletedCount === 0) {
        throw {
            status: 404,
            message: "Fail to delete account.",
        };
    }

    return {
        message: "Account has been deleted.",
    };
};
