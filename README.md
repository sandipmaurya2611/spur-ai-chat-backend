# Chat Backend API - SQLite3 Version

Production-grade backend for AI chat support agent using SQLite3.

## Tech Stack

- Node.js + TypeScript
- Express.js
- SQLite3 (better-sqlite3)
- OpenAI API

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the Backend directory:

```bash
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
NODE_ENV=development
```

**Get your OpenAI API key from**: https://platform.openai.com/api-keys

### 3. Start Development Server

```bash
npm run dev
```

The server will:
- Automatically create `chat.db` SQLite database file
- Initialize the schema automatically
- Start on `http://localhost:3000`

**That's it!** No database setup required - SQLite creates the database file automatically.

## API Endpoints

### POST /chat/message

Send a message and get AI response.

**Request:**
```json
{
  "message": "What are your shipping options?",
  "sessionId": "optional-uuid"
}
```

**Response:**
```json
{
  "reply": "We offer worldwide shipping in 5-7 days...",
  "sessionId": "uuid-here"
}
```

### GET /chat/history/:sessionId

Get conversation history for a session.

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "sender": "user",
      "text": "Hello",
      "timestamp": 1234567890
    }
  ],
  "sessionId": "uuid-here"
}
```

### GET /health

Health check endpoint.

## Database

SQLite3 database file: `chat.db` (created automatically)

**Tables:**
- `conversations` - Session storage
- `messages` - All chat messages

**Schema** is automatically initialized from `src/db/schema.sqlite.sql`

## Features

- ✅ Automatic database creation (no setup needed)
- ✅ Session-based conversations
- ✅ Message persistence
- ✅ OpenAI integration with context
- ✅ Conversation history retrieval
- ✅ Error handling with fallbacks
- ✅ Request validation
- ✅ CORS enabled
- ✅ TypeScript

## Development

```bash
# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Troubleshooting

### Error: "OPENAI_API_KEY environment variable is required"
- Create `.env` file with your OpenAI API key
- Get one from: https://platform.openai.com/api-keys

### Database file location
- The `chat.db` file is created in the Backend root directory
- You can delete it to reset all conversations

### Port already in use
- Change `PORT` in `.env` file
- Or stop the other process using port 3000

## Production Notes

For production deployment:
- The `chat.db` file should be backed up regularly
- Consider using PostgreSQL for multi-server deployments
- SQLite is perfect for single-server deployments
