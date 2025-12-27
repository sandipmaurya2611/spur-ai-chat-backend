import pool from '../db';
import { Conversation } from '../types';
import { DatabaseError } from '../utils/errors';
import { logger } from '../utils/logger';

export class ConversationRepository {
    async create(): Promise<Conversation> {
        try {
            const result = await pool.query(
                'INSERT INTO public.conversations DEFAULT VALUES RETURNING id, created_at'
            );

            const row = result.rows[0];
            return {
                id: row.id,
                createdAt: row.created_at,
            };
        } catch (error) {
            logger.error('Error creating conversation', error);
            throw new DatabaseError('Failed to create conversation');
        }
    }

    async findById(id: string): Promise<Conversation | null> {
        try {
            const result = await pool.query(
                'SELECT id, created_at FROM public.conversations WHERE id = $1',
                [id]
            );

            if (result.rows.length === 0) {
                return null;
            }

            const row = result.rows[0];
            return {
                id: row.id,
                createdAt: row.created_at,
            };
        } catch (error) {
            logger.error('Error finding conversation', error);
            throw new DatabaseError('Failed to find conversation');
        }
    }

    async exists(id: string): Promise<boolean> {
        try {
            const result = await pool.query(
                'SELECT 1 FROM public.conversations WHERE id = $1',
                [id]
            );
            return result.rows.length > 0;
        } catch (error) {
            logger.error('Error checking conversation existence', error);
            throw new DatabaseError('Failed to check conversation');
        }
    }
}

export const conversationRepository = new ConversationRepository();
