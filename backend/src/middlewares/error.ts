import type { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger.js';
import { isHttpError } from '../types/errors.js';

export default (err: unknown, req: Request, res: Response, _next: NextFunction) => {
    logger.error({ err, url: req.originalUrl, method: req.method });

    const status = isHttpError(err) ? (err.status || 500) : 500;
    const message = isHttpError(err) ? (err.status ? err.message : 'Internal server error') : 'Internal server error';

    res.status(status).json({ message });
};
