# Backend Setup Instructions

## Quick Start

### 1. Create .env file

The backend needs a `.env` file with your configuration. Create it now:

```bash
# In d:\Chat\Backend directory, create a file named .env with this content:

GEMINI_API_KEY=your-gemini-api-key-here
MOCK_MODE=false
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chatdb
PORT=3000
NODE_ENV=development
```

**Important:** Replace `your-gemini-api-key-here` with your actual Gemini API key from https://aistudio.google.com/app/apikey

### 2. Set up PostgreSQL Database

You need PostgreSQL installed and running. Then:

```bash
# Create the database
createdb chatdb

# Run the schema
psql -U postgres -d chatdb -f src/db/schema.sql
```

**Alternative:** If you don't have PostgreSQL installed, you can:
- Download from: https://www.postgresql.org/download/windows/
- Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres`

### 3. Start the Backend

```bash
npm run dev
```

The server will start on http://localhost:3000

---

## Current Status

✅ Dependencies installed  
❌ `.env` file missing - **CREATE THIS NOW**  
❌ Database not set up - **DO THIS NEXT**  

---

## Troubleshooting

### Error: "DATABASE_URL environment variable is required"
- You need to create the `.env` file (see step 1)

### Error: "GEMINI_API_KEY environment variable is required..."
- Add your Gemini API key to `.env` file or set `MOCK_MODE=true`
- Get one from: https://aistudio.google.com/app/apikey

### Error: "connection refused" or database errors
- Make sure PostgreSQL is running
- Check the DATABASE_URL in `.env` matches your PostgreSQL setup
- Default: `postgresql://postgres:postgres@localhost:5432/chatdb`

### Error: "relation does not exist"
- Run the schema.sql file: `psql -U postgres -d chatdb -f src/db/schema.sql`

---

## Manual .env File Creation

Since `.env` is gitignored (for security), create it manually:

**Windows PowerShell:**
```powershell
@"
GEMINI_API_KEY=your-gemini-api-key-here
MOCK_MODE=false
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chatdb
PORT=3000
NODE_ENV=development
"@ | Out-File -FilePath .env -Encoding utf8
```

**Or just create the file in VS Code:**
1. Right-click in Backend folder
2. New File → `.env`
3. Paste the content above
4. Replace the API key with your real one

---

## Testing

Once setup is complete:

1. Backend should start without errors
2. Visit http://localhost:3000/health - should return `{"status":"ok"}`
3. Frontend at http://localhost:5173 should connect successfully
