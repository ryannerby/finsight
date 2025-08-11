# Backend Server

Node.js/Express backend API for the thesis project with Supabase integration.

## Features

### Day 1 ✅
- Node/Express app with TypeScript
- Supabase database connection
- Database tables: deals, documents, analyses, qas, logs
- `/health` endpoint

### Day 2 ✅
- Create deal endpoint
- List deals for user endpoint
- Supabase Storage setup for files
- Pre-signed URL generation for file uploads

### Day 3 ✅
- PDF parsing with `pdf-parse`
- CSV parsing with `papaparse`
- File type detection (P&L, balance sheet, etc.)
- Document parsing endpoint

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Create `.env` file (copy from `env.example`):
```bash
cp env.example .env
```

3. Configure your Supabase credentials in `.env`:
```
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:3001`

## API Endpoints

### Health Check
- `GET /api/health` - Returns server status

### Deals
- `POST /api/deals` - Create a new deal
- `GET /api/deals?user_id={id}` - List deals for a user
- `GET /api/deals/:id` - Get specific deal with documents and Q&As

### Files
- `POST /api/files/upload-url` - Get pre-signed URL for file upload
- `POST /api/files/confirm-upload` - Confirm file upload and create document record
- `POST /api/files/parse/:document_id` - Parse a document and extract text
- `GET /api/files/deal/:deal_id?user_id={id}` - Get documents for a deal

## Database Schema

The server automatically creates these tables:
- `deals` - Deal information
- `documents` - Uploaded files metadata
- `analyses` - Document parsing results
- `qas` - Questions and answers
- `logs` - Activity logs

## File Support

- **PDFs**: Text extraction using pdf-parse
- **CSVs**: Structured data parsing using papaparse
- **Text files**: Direct text reading
- **File type detection**: Automatic categorization (P&L, balance sheet, etc.)

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server