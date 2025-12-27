import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';

export const validateChatMessage = (
    req: Request,
    _res: Response,
    next: NextFunction
): void => {
    const { message, sessionId } = req.body;

    // Validate message
    if (!message || typeof message !== 'string') {
        throw new ValidationError('Message is required and must be a string');
    }

    if (message.trim().length === 0) {
        throw new ValidationError('Message cannot be empty');
    }

    if (message.length > 1000) {
        throw new ValidationError('Message is too long (max 1000 characters)');
    }

    // Validate sessionId if provided
    if (sessionId !== undefined) {
        if (typeof sessionId !== 'string') {
            throw new ValidationError('SessionId must be a string');
        }

        // Basic UUID validation
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(sessionId)) {
            throw new ValidationError('Invalid sessionId format');
        }
    }

    next();
};

export const validateSessionId = (
    req: Request,
    _res: Response,
    next: NextFunction
): void => {
    const { sessionId } = req.params;

    if (!sessionId) {
        throw new ValidationError('SessionId is required');
    }

    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionId)) {
        throw new ValidationError('Invalid sessionId format');
    }

    next();
};
