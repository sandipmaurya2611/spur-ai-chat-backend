import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    // Log the error
    logger.error('Error occurred', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    // Handle known operational errors
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            error: err.message,
        });
        return;
    }

    // Handle unknown errors
    res.status(500).json({
        error: 'An unexpected error occurred. Please try again later.',
    });
};
