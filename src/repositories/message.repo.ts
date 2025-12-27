import pool from '../db';
import { Message } from '../types';
import { DatabaseError } from '../utils/errors';
import { logger } from '../utils/logger';

export class MessageRepository {
    async create(
        conversationId: string,
        sender: 'user' | 'ai',
        text: string
    ): Promise<Message> {
        try {
            const result = await pool.query(
                'INSERT INTO public.messages (conversation_id, sender, text) VALUES ($1, $2, $3) RETURNING id, conversation_id, sender, text, created_at',
                [conversationId, sender, text]
            );

            const row = result.rows[0];
            return {
                id: row.id,
                conversationId: row.conversation_id,
                sender: row.sender,
                text: row.text,
                createdAt: row.created_at,
            };
        } catch (error) {
            logger.error('Error creating message', error);
            throw new DatabaseError('Failed to save message');
        }
    }

    async getRecentByConversation(
        conversationId: string,
        limit: number = 10
    ): Promise<Message[]> {
        try {
            // Get most recent messages
            const result = await pool.query(
                'SELECT id, conversation_id, sender, text, created_at FROM public.messages WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT $2',
                [conversationId, limit]
            );

            return result.rows
                .map((row) => ({
                    id: row.id,
                    conversationId: row.conversation_id,
                    sender: row.sender,
                    text: row.text,
                    createdAt: row.created_at,
                }))
                .reverse(); // Reverse to get chronological order (oldest to newest)
        } catch (error) {
            logger.error('Error fetching recent messages', error);
            throw new DatabaseError('Failed to fetch messages');
        }
    }

    async getAllByConversation(conversationId: string): Promise<Message[]> {
        try {
            const result = await pool.query(
                'SELECT id, conversation_id, sender, text, created_at FROM public.messages WHERE conversation_id = $1 ORDER BY created_at ASC',
                [conversationId]
            );

            return result.rows.map((row) => ({
                id: row.id,
                conversationId: row.conversation_id,
                sender: row.sender,
                text: row.text,
                createdAt: row.created_at,
            }));
        } catch (error) {
            logger.error('Error fetching all messages', error);
            throw new DatabaseError('Failed to fetch messages');
        }
    }
}

export const messageRepository = new MessageRepository();
