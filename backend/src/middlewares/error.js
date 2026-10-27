const logger = require('../utils/logger');


module.exports = (err, req, res, next) => {
    logger.error({ err, url: req.originalUrl, method: req.method });

    const status = err.status || 500;
    const message = err.status ? err.message : 'Internal server error';

    res.status(status).json({ message });
};
