const jwt = require('jsonwebtoken');
const config = require('../../../config');
const models = require('../models');

const EXPIRED_SESSION = { status: 401, message: 'Session expired. Please sign in again.' };

module.exports = async ({ refreshToken }) => {
    let decoded;

    try {
        decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
    }
    catch (err) {
        throw EXPIRED_SESSION;
    }

    // The user may have been deleted or unverified since the token was issued.
    const user = await models.findById({ userId: decoded.id });

    if (!user || !user.emailVerified) {
        throw EXPIRED_SESSION;
    }

    const accessToken = jwt.sign({ id: decoded.id }, config.jwtAccessSecret, {
        expiresIn: config.accessTokenExpiresIn
    });

    return { accessToken };
};
