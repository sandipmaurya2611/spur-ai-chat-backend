export interface ChatRequest {
    message: string;
    sessionId?: string;
}

export interface ChatResponse {
    reply: string;
    sessionId: string;
}

export interface Message {
    id: string;
    conversationId: string;
    sender: 'user' | 'ai';
    text: string;
    createdAt: Date;
}

export interface Conversation {
    id: string;
    createdAt: Date;
}

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface HistoryResponse {
    messages: Array<{
        id: string;
        sender: 'user' | 'ai';
        text: string;
        timestamp: number;
    }>;
    sessionId: string;
}
