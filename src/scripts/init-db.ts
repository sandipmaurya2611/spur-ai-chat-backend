import fs from 'fs';
import path from 'path';
import pool from '../db';
import { logger } from '../utils/logger';

async function initDb() {
    try {
        const schemaPath = path.join(__dirname, '../db/schema_fix.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        logger.info('Running database initialization...');

        await pool.query(schemaSql);

        logger.info('Database initialized successfully');
        process.exit(0);
    } catch (error) {
        logger.error('Failed to initialize database', error);
        process.exit(1);
    }
}

initDb();
