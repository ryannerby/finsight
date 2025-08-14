-- Migration: Add Enhanced Analysis Report System
-- Date: 2025-08-14
-- Description: Adds comprehensive reporting capabilities with evidence tracking, exports, and Q&A-ready output

-- Enhanced Analysis Reports table
CREATE TABLE IF NOT EXISTS analysis_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('comprehensive', 'financial_summary', 'risk_assessment', 'due_diligence', 'custom')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'archived')),
  generated_by TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  version INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Report Sections table for modular report structure
CREATE TABLE IF NOT EXISTS report_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES analysis_reports(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL CHECK (section_type IN ('executive_summary', 'financial_analysis', 'risk_assessment', 'evidence', 'recommendations', 'appendix')),
  title TEXT NOT NULL,
  content TEXT,
  order_index INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evidence Items table for tracking supporting documentation
CREATE TABLE IF NOT EXISTS evidence_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES analysis_reports(id) ON DELETE CASCADE,
  section_id UUID REFERENCES report_sections(id) ON DELETE CASCADE,
  evidence_type TEXT NOT NULL CHECK (evidence_type IN ('financial_data', 'document_excerpt', 'calculation', 'external_source', 'assumption', 'note')),
  title TEXT NOT NULL,
  description TEXT,
  source_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  source_page INTEGER,
  source_text TEXT,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report Exports table for tracking generated exports
CREATE TABLE IF NOT EXISTS report_exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES analysis_reports(id) ON DELETE CASCADE,
  export_format TEXT NOT NULL CHECK (export_format IN ('pdf', 'docx', 'xlsx', 'html', 'json')),
  file_path TEXT NOT NULL,
  file_size INTEGER,
  generated_by TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  download_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Report Templates table for reusable report structures
CREATE TABLE IF NOT EXISTS report_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  template_type TEXT NOT NULL CHECK (template_type IN ('standard', 'custom', 'industry_specific')),
  sections JSONB NOT NULL, -- Array of section definitions
  is_active BOOLEAN DEFAULT true,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report Sharing and Access Control
CREATE TABLE IF NOT EXISTS report_sharing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES analysis_reports(id) ON DELETE CASCADE,
  shared_with TEXT NOT NULL, -- User ID or email
  access_level TEXT NOT NULL DEFAULT 'view' CHECK (access_level IN ('view', 'comment', 'edit', 'admin')),
  shared_by TEXT NOT NULL,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Report Comments and Collaboration
CREATE TABLE IF NOT EXISTS report_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES analysis_reports(id) ON DELETE CASCADE,
  section_id UUID REFERENCES report_sections(id) ON DELETE CASCADE,
  commenter_id TEXT NOT NULL,
  comment TEXT NOT NULL,
  parent_comment_id UUID REFERENCES report_comments(id) ON DELETE CASCADE,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Q&A with Report Context
CREATE TABLE IF NOT EXISTS report_qa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES analysis_reports(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  question_context JSONB, -- Additional context about the question
  answer_evidence JSONB, -- Evidence supporting the answer
  asked_by TEXT NOT NULL,
  answered_by TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'requires_clarification', 'archived')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  answered_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analysis_reports_deal_id ON analysis_reports(deal_id);
CREATE INDEX IF NOT EXISTS idx_analysis_reports_status ON analysis_reports(status);
CREATE INDEX IF NOT EXISTS idx_analysis_reports_generated_by ON analysis_reports(generated_by);
CREATE INDEX IF NOT EXISTS idx_analysis_reports_report_type ON analysis_reports(report_type);

CREATE INDEX IF NOT EXISTS idx_report_sections_report_id ON report_sections(report_id);
CREATE INDEX IF NOT EXISTS idx_report_sections_order ON report_sections(report_id, order_index);

CREATE INDEX IF NOT EXISTS idx_evidence_items_report_id ON evidence_items(report_id);
CREATE INDEX IF NOT EXISTS idx_evidence_items_section_id ON evidence_items(section_id);
CREATE INDEX IF NOT EXISTS idx_evidence_items_type ON evidence_items(evidence_type);

CREATE INDEX IF NOT EXISTS idx_report_exports_report_id ON report_exports(report_id);
CREATE INDEX IF NOT EXISTS idx_report_exports_format ON report_exports(export_format);

CREATE INDEX IF NOT EXISTS idx_report_sharing_report_id ON report_sharing(report_id);
CREATE INDEX IF NOT EXISTS idx_report_sharing_shared_with ON report_sharing(shared_with);

CREATE INDEX IF NOT EXISTS idx_report_comments_report_id ON report_comments(report_id);
CREATE INDEX IF NOT EXISTS idx_report_comments_section_id ON report_comments(section_id);

CREATE INDEX IF NOT EXISTS idx_report_qa_report_id ON report_qa(report_id);
CREATE INDEX IF NOT EXISTS idx_report_qa_status ON report_qa(status);
CREATE INDEX IF NOT EXISTS idx_report_qa_asked_by ON report_qa(asked_by);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_analysis_reports_updated_at BEFORE UPDATE ON analysis_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_sections_updated_at BEFORE UPDATE ON report_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_comments_updated_at BEFORE UPDATE ON report_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_qa_updated_at BEFORE UPDATE ON report_qa
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default report template
INSERT INTO report_templates (name, description, template_type, sections, created_by) VALUES (
  'Standard Financial Analysis',
  'Default template for comprehensive financial analysis reports',
  'standard',
  '[
    {"type": "executive_summary", "title": "Executive Summary", "required": true, "order": 1},
    {"type": "financial_analysis", "title": "Financial Analysis", "required": true, "order": 2},
    {"type": "risk_assessment", "title": "Risk Assessment", "required": true, "order": 3},
    {"type": "evidence", "title": "Supporting Evidence", "required": true, "order": 4},
    {"type": "recommendations", "title": "Recommendations", "required": true, "order": 5},
    {"type": "appendix", "title": "Appendix", "required": false, "order": 6}
  ]'::jsonb,
  'system'
) ON CONFLICT (name) DO NOTHING;
