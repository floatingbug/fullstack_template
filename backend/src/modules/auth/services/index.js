const signUp = require('./signUp');
const signIn = require('./signIn');
const refreshToken = require('./refreshToken');
const resendVerificationEmail = require("./resendVerificationEmail");
const forgotPassword = require("./forgotPassword");
const resetPassword = require("./resetPassword");

module.exports = {
    signUp,
    signIn,
    refreshToken,
    resendVerificationEmail,
    forgotPassword,
    resetPassword,
};
