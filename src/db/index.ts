import { Pool } from 'pg';
import config from '../config';
import { logger } from '../utils/logger';

// Create PostgreSQL connection pool
const pool = new Pool({
    connectionString: config.databaseUrl,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: {
        rejectUnauthorized: false // Required for Supabase connections
    }
});

// Test connection
pool.on('connect', () => {
    logger.info('Database connected successfully');
});

pool.on('error', (err) => {
    logger.error('Unexpected database error', err);
});

export default pool;
