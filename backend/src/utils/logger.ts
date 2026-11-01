import pino from 'pino';
import type { DestinationStream, Logger } from 'pino';
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const isCompiled = currentDir.includes(`${path.sep}dist${path.sep}`);
const backendRoot = path.resolve(currentDir, isCompiled ? '../../..' : '../..');

const isProduction = process.env.NODE_ENV === 'production';

type AppLogger = Logger & { logError: (errObj: unknown) => void };

let logger: AppLogger;

if (isProduction) {
    // Create logs directory if it doesn't exist
    const logDir = path.join(backendRoot, 'logs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

    // Separate streams for info and error
    const infoStream: DestinationStream = pino.destination(path.join(logDir, 'info.log'));
    const errorStream: DestinationStream = pino.destination(path.join(logDir, 'error.log'));

    // Main logger instance (info and above go to info.log)
    logger = Object.assign(pino({ level: process.env.LOG_LEVEL || 'info' }, infoStream), {
        logError: (errObj: unknown) => {
            errorStream.write(JSON.stringify(errObj) + '\n');
        },
    });
} else {
    // Development: log to console using pino-pretty (ensure it's installed)
    let transport: unknown;
    try {
        transport = require('pino-pretty');
    } catch {
        console.warn('pino-pretty not installed, falling back to console output');
        transport = undefined;
    }

    if (transport) {
        logger = Object.assign(
            pino({ level: process.env.LOG_LEVEL || 'debug', transport: { target: 'pino-pretty', options: { colorize: true } } }),
            { logError: (errObj: unknown) => console.error(errObj) },
        );
    } else {
        logger = Object.assign(pino({ level: process.env.LOG_LEVEL || 'debug' }), {
            logError: (errObj: unknown) => console.error(errObj),
        });
    }
}

export default logger;
