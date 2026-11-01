const setPendingEmail = require("./setPendingEmail");
const clearPendingEmail = require("./clearPendingEmail");
const updateName = require("./updateName");
const updatePassword = require("./updatePassword");
const getUserById = require("./getUserById");
const findUserByEmail = require("./findUserByEmail");
const confirmPendingEmailChange = require("./confirmPendingEmailChange");
const findUserByEmailConfirmationToken = require("./findUserByEmailConfirmationToken");

module.exports = {
    setPendingEmail,
    clearPendingEmail,
    updateName,
    updatePassword,
    getUserById,
    findUserByEmail,
    confirmPendingEmailChange,
    findUserByEmailConfirmationToken,
};
