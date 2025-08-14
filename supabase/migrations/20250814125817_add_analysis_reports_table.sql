-- Add analysis_reports table for enhanced analysis
CREATE TABLE IF NOT EXISTS analysis_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('comprehensive', 'financial_summary', 'risk_assessment', 'due_diligence', 'custom')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'failed', 'archived')),
  generated_by TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  version INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  
  -- Enhanced analysis fields
  summary_report JSONB DEFAULT '{}',
  traffic_lights JSONB DEFAULT '{}',
  strengths JSONB DEFAULT '[]',
  risks JSONB DEFAULT '[]',
  recommendation JSONB DEFAULT '{}',
  evidence_map JSONB DEFAULT '{}',
  confidence_scores JSONB DEFAULT '{}',
  data_quality_assessment JSONB DEFAULT '{}',
  export_version TEXT DEFAULT 'v1',
  claude_usage JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_analysis_reports_deal_id ON analysis_reports(deal_id);
CREATE INDEX IF NOT EXISTS idx_analysis_reports_status ON analysis_reports(status);
CREATE INDEX IF NOT EXISTS idx_analysis_reports_generated_at ON analysis_reports(generated_at);
CREATE INDEX IF NOT EXISTS idx_analysis_reports_report_type ON analysis_reports(report_type);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_analysis_reports_updated_at 
    BEFORE UPDATE ON analysis_reports 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE analysis_reports ENABLE ROW LEVEL SECURITY;

-- Users can only see reports for deals they own
CREATE POLICY "Users can view their own analysis reports" ON analysis_reports
    FOR SELECT USING (
        deal_id IN (
            SELECT id FROM deals WHERE user_id = auth.uid()
        )
    );

-- Users can only create reports for deals they own
CREATE POLICY "Users can create reports for their own deals" ON analysis_reports
    FOR INSERT WITH CHECK (
        deal_id IN (
            SELECT id FROM deals WHERE user_id = auth.uid()
        )
    );

-- Users can only update reports for deals they own
CREATE POLICY "Users can update their own analysis reports" ON analysis_reports
    FOR UPDATE USING (
        deal_id IN (
            SELECT id FROM deals WHERE user_id = auth.uid()
        )
    );

-- Users can only delete reports for deals they own
CREATE POLICY "Users can delete their own analysis reports" ON analysis_reports
    FOR DELETE USING (
        deal_id IN (
            SELECT id FROM deals WHERE user_id = auth.uid()
        )
    );
