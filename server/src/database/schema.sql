-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Deals table
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  file_type TEXT, -- 'P&L', 'balance_sheet', 'cash_flow', 'other'
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analyses table
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  parsed_text TEXT,
  analysis_type TEXT, -- 'financial', 'legal', 'technical'
  analysis_result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Q&A table
CREATE TABLE IF NOT EXISTS qas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  context JSONB, -- Related documents, analysis results, etc.
  asked_by TEXT NOT NULL, -- user_id
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logs table
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL, -- 'created_deal', 'uploaded_document', 'asked_question', etc.
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deals_user_id ON deals(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_deal_id ON documents(deal_id);
CREATE INDEX IF NOT EXISTS idx_analyses_document_id ON analyses(document_id);
CREATE INDEX IF NOT EXISTS idx_qas_deal_id ON qas(deal_id);
CREATE INDEX IF NOT EXISTS idx_logs_deal_id ON logs(deal_id);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);