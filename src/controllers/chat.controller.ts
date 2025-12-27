import { Request, Response, NextFunction } from 'express';
import { conversationRepository } from '../repositories/conversation.repo';
import { messageRepository } from '../repositories/message.repo';
import { llmService } from '../services/llm.service';
import { NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

export class ChatController {
    async sendMessage(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { message, sessionId } = req.body;

            let conversationId: string;

            // Create new conversation or validate existing one
            if (!sessionId) {
                logger.info('Creating new conversation');
                const conversation = await conversationRepository.create();
                conversationId = conversation.id;
            } else {
                logger.info('Using existing conversation', { sessionId });
                const exists = await conversationRepository.exists(sessionId);

                if (!exists) {
                    throw new NotFoundError('Session not found');
                }

                conversationId = sessionId;
            }

            // Save user message
            await messageRepository.create(conversationId, 'user', message);

            // Fetch recent conversation history for context
            const recentMessages = await messageRepository.getRecentByConversation(
                conversationId,
                10
            );

            // Generate AI response
            const aiReply = await llmService.generateResponse(recentMessages);

            // Save AI response
            await messageRepository.create(conversationId, 'ai', aiReply);

            logger.info('Message processed successfully', { conversationId });

            res.json({
                reply: aiReply,
                sessionId: conversationId,
            });
        } catch (error) {
            next(error);
        }
    }

    async getHistory(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { sessionId } = req.params;

            logger.info('Fetching conversation history', { sessionId });

            // Check if conversation exists
            const exists = await conversationRepository.exists(sessionId);

            if (!exists) {
                throw new NotFoundError('Session not found');
            }

            // Fetch all messages for this conversation
            const messages = await messageRepository.getAllByConversation(sessionId);

            // Format response
            const formattedMessages = messages.map((msg) => ({
                id: msg.id,
                sender: msg.sender,
                text: msg.text,
                timestamp: msg.createdAt.getTime(),
            }));

            logger.info('History fetched successfully', {
                sessionId,
                messageCount: formattedMessages.length,
            });

            res.json({
                messages: formattedMessages,
                sessionId,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const chatController = new ChatController();
