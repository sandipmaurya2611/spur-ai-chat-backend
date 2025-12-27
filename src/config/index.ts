import dotenv from 'dotenv';

dotenv.config();

interface Config {
    port: number;
    nodeEnv: string;
    databaseUrl: string;
    geminiApiKey: string;
    useMockLLM: boolean;
    corsOrigin: string;
}

const config: Config = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL || '',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    useMockLLM: process.env.MOCK_MODE === 'true',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

// Startup Visibility Log (Mandatory)
console.log('LLM Config {', {
    MOCK_MODE: process.env.MOCK_MODE,
    useMockLLM: config.useMockLLM,
    geminiKeyPresent: !!config.geminiApiKey
}, '}');

// Validate required environment variables
if (!config.databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
}

if (!config.useMockLLM && !config.geminiApiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required when MOCK_MODE is false');
}

export default config;
