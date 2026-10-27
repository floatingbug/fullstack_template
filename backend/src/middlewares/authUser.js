const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = (req, res, next) => {
    const header = req.headers.authorization;

    if (!header) {
        return res.status(401).json({ message: 'Missing authorization header' });
    }

    const token = header.split(' ')[1];

    try {
        const decoded = jwt.verify(token, config.jwtAccessSecret);
        req.user = decoded;
        return next();
    }
    catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
