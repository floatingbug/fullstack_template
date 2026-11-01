const signUp = require('./signUp');
const signIn = require('./signIn');
const refreshToken = require('./refreshToken');
const verifyEmail = require("./verifyEmail");
const resendVerificationEmail = require("./resendVerificationEmail");
const signOut = require("./signOut");
const forgotPassword = require("./forgotPassword");
const resetPassword = require("./resetPassword");

module.exports = {
    signUp,
    signIn,
    signOut,
    refreshToken,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPassword,
};
