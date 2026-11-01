import type { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger.js';
import { AppError, isHttpError } from '../types/errors.js';

export default (err: unknown, req: Request, res: Response, _next: NextFunction) => {
    logger.error({ err, url: req.originalUrl, method: req.method });

    let status = 500;
    let message: unknown = 'Internal server error';

    if (err instanceof AppError) {
        status = err.status;
        message = err.message;
    } else if (isHttpError(err)) {
        // Validator and body-parser errors carry their own status (e.g. 400/415).
        status = err.status || 500;
        message = err.status ? err.message : 'Internal server error';
    }

    res.status(status).json({ message });
};
