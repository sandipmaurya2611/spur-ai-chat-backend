import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config';
import { Message } from '../types';
import { logger } from '../utils/logger';
import { getMockResponse } from './mock-llm.response';

const SYSTEM_PROMPT = `You are a trained customer support agent for an e-commerce company.

This is a production support system, not a general chatbot.

--------------------
ROLE & OBJECTIVE
--------------------
Your goal is to help customers with store-related questions clearly, politely,
and efficiently, just like a human support executive.

--------------------
TONE & STYLE
--------------------
- Friendly, professional, and natural
- Concise by default (2–3 sentences)
- Human-like, not robotic or FAQ-style

--------------------
STRICT RULES
--------------------
1. Answer ONLY store-related questions.
2. Use ONLY the knowledge provided below.
3. Never invent policies, timelines, or guarantees.
4. Do NOT repeat the same sentence structure across replies.
5. Do NOT mention support contact details unless escalation is required.
6. If the user greets, greet back politely.
7. If the question is unclear, ask ONE clarifying question.
8. If the same question is repeated, rephrase the response.
9. If the user asks for information you cannot access (e.g., order status),
   politely explain the limitation and escalate.

--------------------
STORE KNOWLEDGE (SOURCE OF TRUTH)
--------------------
Shipping:
- Worldwide shipping available
- Delivery time: 5–7 business days
- Tracking details are emailed once the order ships

Returns:
- 7-day return policy from delivery date
- Items must be unused and in original packaging
- Refunds processed within 5–7 business days after return receipt

Support:
- Available Monday to Friday, 10:00 AM – 6:00 PM IST

--------------------
PROCESS HANDLING
--------------------
- If the user asks about a PROCESS (e.g., delivery flow):
  Explain step-by-step in simple language.
- If the user asks about a POLICY:
  Answer clearly without over-explaining.
- Do not repeat policy text unless necessary.

--------------------
ESCALATION RULE
--------------------
Escalate ONLY when:
- Order-specific information is required
- The same question is asked multiple times
- The request is outside your knowledge scope

When escalating, be brief and polite.

--------------------
OUTPUT FORMAT
--------------------
- Plain text only
- No emojis
- No markdown
- No bullet points unless explicitly requested

--------------------
REMEMBER
--------------------
You are simulating a real support agent in a SaaS product.
Your priority is clarity, trust, and consistency.`;

class LLMService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private sessionIntents: Map<string, any> = new Map();

  constructor() {
    // Only initialize Gemini if in real mode and key is present
    if (!config.useMockLLM && config.geminiApiKey) {
      this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
      // Use the correct stable model identifier for Gemini 2.5 Flash
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    } else if (!config.useMockLLM) {
      logger.warn('LLM mode is set to "real" but no GEMINI_API_KEY provided. Service may fail.');
    } else {
      logger.info('LLMService initialized in MOCK mode');
    }
  }

  async generateResponse(conversationHistory: Message[]): Promise<string> {
    try {
      // MOCK MODE HANDLING
      if (config.useMockLLM) {
        const lastUserMessage = conversationHistory[conversationHistory.length - 1];

        // Blank input validation (Strict Check)
        const userText = lastUserMessage?.text || '';
        if (!userText.trim()) {
          return "Please enter a message so I can help you.";
        }

        // Simple in-memory context (optional improvement: rely on DB or cache)
        // For now, we'll simulate context awareness by checking if the previous agent message exists
        // and if it contained specific keywords, but for true "intent" tracking we'd need persisted state.
        // Let's rely on the granular regexes in detectIntent which are quite powerful even without state,
        // AND pass the previous intent if we can track it. 

        // Since LLMService is a singleton, we can use a Map keyed by conversationId if available.
        // But for safety, let's just default to no previous intent for now unless we verify message structure.
        let previousIntent: any = undefined;
        if (lastUserMessage.conversationId && this.sessionIntents.has(lastUserMessage.conversationId)) {
          previousIntent = this.sessionIntents.get(lastUserMessage.conversationId);
        }

        logger.info('Generating mock response', { userText, previousIntent });

        // Simulate network latency (500-1000ms)
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

        const response = getMockResponse(userText, previousIntent);

        // Store new intent
        if (lastUserMessage.conversationId) {
          this.sessionIntents.set(lastUserMessage.conversationId, response.intent);
        }

        return response.text;
      }

      // REAL MODE HANDLING
      if (!this.model) {
        throw new Error('LLM Service not initialized correctly for real mode');
      }

      // Build conversation context
      const conversationContext = conversationHistory
        .map((msg) => `${msg.sender === 'user' ? 'Customer' : 'Agent'}: ${msg.text}`)
        .join('\n');

      // Construct the full prompt
      const fullPrompt = `${SYSTEM_PROMPT}

CONVERSATION HISTORY:
${conversationContext}

Please provide a helpful response to the customer's latest message. Remember to be concise, professional, and only use information from the knowledge base.`;

      logger.info('Calling Gemini API', {
        messageCount: conversationHistory.length,
        model: 'gemini-2.5-flash'
      });

      // Use generateContent (NOT startChat or sendMessage)
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      logger.debug('Gemini API response received', {
        responseLength: text?.length || 0
      });

      return text || "I apologize, I couldn't generate a response. Please contact our support team directly at support@example.com.";
    } catch (error: any) {
      logger.error('Gemini API error', {
        error: error.message,
        status: error.status,
        statusText: error.statusText
      });

      // RATE LIMIT HANDLING (429)
      if (error.status === 429 || (error.message && error.message.includes('429'))) {
        logger.warn('Gemini API rate limit hit. Returning fallback message.');
        return "I’m currently handling a high volume of requests. Please try again shortly.";
      }

      // Graceful fallback for any other errors
      return "I apologize, but I'm having trouble processing your request at the moment. Please try again or contact our support team directly at support@example.com (Mon-Fri, 10am-6pm IST).";
    }
  }
}

export const llmService = new LLMService();
