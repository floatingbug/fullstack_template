const pino = require('pino');
const path = require('path');
const fs = require('fs');

const isProduction = process.env.NODE_ENV === 'production';

let logger;

if (isProduction) {
    // Create logs directory if it doesn't exist
    const logDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

    // Separate streams for info and error
    const infoStream = pino.destination(path.join(logDir, 'info.log'));
    const errorStream = pino.destination(path.join(logDir, 'error.log'));

    // Main logger instance (info and above go to info.log)
    logger = pino({ level: process.env.LOG_LEVEL || 'info' }, infoStream);

    // Helper to write errors to error.log
    logger.logError = (errObj) => {
        errorStream.write(JSON.stringify(errObj) + '\n');
    };
} else {
    // Development: log to console using pino-pretty (ensure it's installed)
    let transport;
    try {
        transport = require('pino-pretty');
    } catch (e) {
        console.warn('pino-pretty not installed, falling back to console output');
        transport = undefined;
    }

    if (transport) {
        logger = pino({ level: process.env.LOG_LEVEL || 'debug', transport: { target: 'pino-pretty', options: { colorize: true } } });
    } else {
        logger = pino({ level: process.env.LOG_LEVEL || 'debug' });
    }

    logger.logError = (errObj) => console.error(errObj);
}

module.exports = logger;
