import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';
import { validateChatMessage, validateSessionId } from '../middleware/validator';

const router = Router();

// POST /chat/message - Send a message and get AI response
router.post('/message', validateChatMessage, (req, res, next) => {
    chatController.sendMessage(req, res, next);
});

// GET /chat/history/:sessionId - Get conversation history
router.get('/history/:sessionId', validateSessionId, (req, res, next) => {
    chatController.getHistory(req, res, next);
});

export default router;
