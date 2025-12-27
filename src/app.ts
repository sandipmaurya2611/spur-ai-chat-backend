import express, { Request, Response } from 'express';
import cors from 'cors';
import chatRoutes from './routes/chat.routes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import config from './config';

const app = express();

// Production-grade CORS configuration
const allowedOrigins = config.corsOrigin.split(',').map(origin => origin.trim());

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or postman)
        if (!origin) return callback(null, true);

        const isAllowed = allowedOrigins.includes(origin) || config.nodeEnv === 'development';

        if (isAllowed) {
            callback(null, true);
        } else {
            logger.warn(`CORS blocked for origin: ${origin}`);
            // Do not pass an error to callback, just pass false to fail gracefully
            callback(null, false);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// Enable pre-flight across-the-board
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/chat', chatRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
