const config = require("../../../config");
const model = require("../models");
const jwt = require("jsonwebtoken");
const { comparePassword } = require("../../../utils/password");
const { normalizeEmail, normalizeName } = require("../../../utils/normalize");

// Promisify jsonwebtoken.sign
jwt.signAsync = (payload, secret, options) => {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, secret, options, (err, token) => {
            if (err){
                reject(err);
            }
            else{
                resolve(token);
            }
        });
    });
};

module.exports = async ({ nameOrEmail, password }) => {
    let user;

    // Check if nameOrEmail is email
    if (nameOrEmail.includes("@")){
        user = await model.findByEmail({ email: normalizeEmail(nameOrEmail) });
    }
    else{
        user = await model.findByName({ name: normalizeName(nameOrEmail) });
    }

    if (!user){
        throw { status: 401, message: "Invalid credentials" };
    }

    if (!user.emailVerified) {
        throw { status: 403, message: "Please verify your email address first." };
    }

    const correctPassword = await comparePassword(password, user.password);

    if (!correctPassword){
        throw { status: 401, message: "Invalid credentials" };
    }

    const accessToken = await jwt.signAsync(
        { id: user._id },
        config.jwtAccessSecret,
        { expiresIn: config.accessTokenExpiresIn }
    );

    const refreshToken = await jwt.signAsync(
        { id: user._id },
        config.jwtRefreshSecret,
        { expiresIn: config.refreshTokenExpiresIn }
    );

    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        },
        accessToken,
        refreshToken,
    };
};
