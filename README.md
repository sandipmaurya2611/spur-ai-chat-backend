# AI Support Chat - Backend

A production-grade, highly scalable backend for an AI-powered chat support agent. Built with **Node.js**, **Express**, and **TypeScript**, it features a robust **PostgreSQL** integration (Supabase) and leverages the **Google Gemini AI** for intelligent responses.

## 🚀 Tech Stack

- **Runtime:** [Node.js](https://nodejs.org/) (v20+)
- **Framework:** [Express](https://expressjs.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (via [Supabase](https://supabase.com/))
- **AI Engine:** [Google Gemini AI](https://ai.google.dev/) (Generative AI)
- **Environment Management:** [dotenv](https://github.com/motdotla/dotenv)
- **CORS:** [cors](https://github.com/expressjs/cors)
- **Logging:** Custom Winston-based Logger
- **Build Tool:** [tsc](https://www.typescriptlang.org/docs/handbook/compiler-options.html) (TypeScript Compiler)

## ✨ Key Features

- **Gemini AI Integration:** Advanced LLM capabilities for generating contextual support responses.
- **PostgreSQL Persistence:** Permanent storage for conversations and messages using a robust SQL schema.
- **Production CORS Handling:** Secure, environment-driven origin whitelisting for Vercel/Production safety.
- **Strict Type Safety:** Full TypeScript implementation across all layers (Controllers, Repositories, Services).
- **Environment-Driven Config:** Centralized configuration with mandatory presence validation for API keys and DB URLs.
- **Mock Mode:** Dedicated `MOCK_MODE` for testing without consuming AI API credits.
- **Graceful Shutdown:** Handles `SIGTERM`/`SIGINT` to close database pools and servers cleanly.
- **Preflight Support:** Industry-standard handling for browser `OPTIONS` requests.

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v20.x or higher)
- [npm](https://www.npmjs.com/)
- A **PostgreSQL** database (e.g., Supabase connection string)
- A **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/))

## 🛠️ Installation & Setup

1. **Navigate to the backend directory:**
   ```bash
   cd Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root of the `Backend` directory:
   ```env
   # Server Config
   PORT=3000
   NODE_ENV=development

   # Database
   DATABASE_URL=your_postgresql_connection_string

   # AI Configuration
   GEMINI_API_KEY=your_gemini_api_key
   MOCK_MODE=false

   # Security
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Initialize Database:**
   Ensure your PostgreSQL schema is initialized. You can find the schema in `src/db/schema.sql`.

5. **Start the development server:**
   ```bash
   npm run dev
   ```

## 🏗️ Architecture

The backend follows a clean, layered architecture:
- `src/controllers/`: Request handling and orchestration.
- `src/services/`: Business logic and external API integrations (Gemini).
- `src/repositories/`: Database abstraction layer (PostgreSQL).
- `src/db/`: Database connection pooling and schemas.
- `src/middleware/`: CORS handling, error management, and validation.
- `src/types/`: Shared TypeScript interfaces.
- `src/utils/`: Shared utilities (Logger, Custom Errors).

## 📜 API Endpoints

- **POST `/chat/message`**: Processes user messages and returns AI responses.
- **GET `/chat/history/:sessionId`**: Retrieves conversation history for a specific session.
- **GET `/health`**: Returns the health status and timestamp of the server.

## 🌐 Deployment (Railway)

This backend is optimized for deployment on [Railway](https://railway.app/).


