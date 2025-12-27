import app from './app';
import config from './config';
import pool from './db';
import { logger } from './utils/logger';

const PORT = config.port;

// Test database connection before starting server
async function startServer() {
    try {
        // Test database connection
        await pool.query('SELECT NOW()');
        logger.info('Database connection successful');

        // Start server
        const server = app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
            logger.info(`Environment: ${config.nodeEnv}`);
            logger.info(`Health check: http://localhost:${PORT}/health`);
        });

        // Graceful shutdown
        const shutdown = async () => {
            logger.info('Shutting down gracefully...');

            server.close(() => {
                logger.info('HTTP server closed');
            });

            await pool.end();
            logger.info('Database connection closed');

            process.exit(0);
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
    } catch (error) {
        logger.error('Failed to start server', error);
        process.exit(1);
    }
}

startServer();
