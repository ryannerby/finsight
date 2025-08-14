// Local copy of analysis types to avoid import issues
export interface TReportGenerationRequest {
  deal_id: string;
  report_type: 'comprehensive' | 'financial_summary' | 'risk_assessment' | 'due_diligence' | 'custom';
  title: string;
  description?: string;
  template_id?: string;
  custom_sections?: string[];
  include_evidence: boolean;
  include_qa: boolean;
  export_formats: ('pdf' | 'docx' | 'xlsx' | 'html' | 'json')[];
  generated_by?: string;
  metadata?: Record<string, any>;
}

export interface TReportGenerationResponse {
  success: boolean;
  report_id?: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  message?: string;
  progress?: number;
  estimated_completion?: string;
  error?: string;
}

export interface TAnalysisReport {
  id?: string;
  deal_id: string;
  report_type: 'comprehensive' | 'financial_summary' | 'risk_assessment' | 'due_diligence' | 'custom';
  title: string;
  description?: string;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  generated_by: string;
  generated_at?: string;
  completed_at?: string;
  last_modified?: string;
  version: number;
  metadata: Record<string, any>;
}

export interface TReportQA {
  id?: string;
  question: string;
  answer?: string;
  question_context?: Record<string, any>;
  answer_evidence?: Record<string, any>;
  asked_by: string;
  answered_by?: string;
  status: 'pending' | 'answered' | 'requires_clarification' | 'archived';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  tags?: string[];
  created_at?: string;
  answered_at?: string;
  updated_at?: string;
}

export interface TEvidenceItem {
  id?: string;
  evidence_type: 'financial_data' | 'document_excerpt' | 'calculation' | 'external_source' | 'assumption' | 'note';
  title: string;
  description?: string;
  source_document_id?: string;
  source_page?: number;
  source_text?: string;
  confidence_score?: number;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface TReportSection {
  id?: string;
  section_type: 'executive_summary' | 'financial_analysis' | 'risk_assessment' | 'evidence' | 'recommendations' | 'appendix';
  title: string;
  content?: string;
  order_index: number;
  is_required: boolean;
  created_at?: string;
  updated_at?: string;
}

// Enhanced Analysis Types - Aligned with SummaryReport schema
export interface EnhancedAnalysisRequest {
  deal_id: string;
  analysis_type: 'comprehensive_report' | 'financial_summary' | 'risk_assessment' | 'due_diligence';
  include_evidence: boolean;
  include_qa_ready: boolean;
  custom_prompts?: string[];
  export_formats: ('pdf' | 'docx' | 'xlsx' | 'html' | 'json')[];
  metadata?: Record<string, any>;
}

export interface EnhancedAnalysisResult {
  analysis_id: string;
  report_id?: string;
  status: 'processing' | 'completed' | 'failed';
  progress?: number;
  result?: {
    summary?: any;
    metrics?: any;
    dd_signals?: any;
    evidence_items?: TEvidenceItem[];
    qa_insights?: TReportQA[];
  };
  error?: string;
  created_at: string;
  completed_at?: string;
}

// Define SummaryReport types locally to avoid import issues
export interface Evidence {
  type: 'metric' | 'excerpt' | 'calculation';
  ref: string;
  value?: string | number;
  document_id?: string;
  page?: number;
  quote?: string;
  confidence: number;
  context?: string;
}

export interface TrafficLight {
  status: 'green' | 'yellow' | 'red';
  score: number;
  reasoning: string;
  evidence: Evidence[];
}

export interface StrengthRisk {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  urgency?: 'immediate' | 'near_term' | 'long_term';
  evidence: Evidence[];
  quantified_impact?: string;
}

export interface DataQuality {
  completeness: number;
  consistency: number;
  recency: number;
  missing_periods: string[];
  data_gaps: string[];
  reliability_notes: string[];
}

export interface SummaryReport {
  health_score: {
    overall: number;
    components: {
      profitability: number;
      growth: number;
      liquidity: number;
      leverage: number;
      efficiency: number;
      data_quality: number;
    };
    methodology: string;
  };
  traffic_lights: {
    revenue_quality: TrafficLight;
    margin_trends: TrafficLight;
    liquidity: TrafficLight;
    leverage: TrafficLight;
    working_capital: TrafficLight;
    data_quality: TrafficLight;
  };
  top_strengths: StrengthRisk[];
  top_risks: StrengthRisk[];
  recommendation: {
    decision: 'Proceed' | 'Caution' | 'Pass';
    confidence: number;
    rationale: string;
    key_factors: string[];
    valuation_impact?: string;
    deal_structure_notes?: string;
  };
  analysis_metadata: {
    period_range: {
      start: string;
      end: string;
      total_periods: number;
    };
    data_quality: DataQuality;
    assumptions: string[];
    limitations: string[];
    followup_questions: string[];
  };
  confidence: {
    overall: number;
    sections: Record<string, number>;
    reliability_factors: string[];
  };
  export_ready: {
    pdf_title: string;
    executive_summary: string;
    key_metrics_table: Array<{
      metric: string;
      value: string;
      trend: 'improving' | 'stable' | 'declining' | 'volatile';
      benchmark?: string;
    }>;
  };
}

// Enhanced Analysis Context
export interface EnhancedReportContext {
  dealId: string;
  periodicity: 'monthly' | 'quarterly' | 'annual';
  computedMetrics: any;
  inventory: any;
  data_quality: any;
  excerpts?: any[];
  benchmarks?: any;
  analysis_timestamp: string;
}

// Claude Usage Stats
export interface ClaudeUsageStats {
  total_tokens: number;
  input_tokens: number;
  output_tokens: number;
  response_time_ms: number;
  model_version: string;
  attempt_count: number;
}

// Generation Stats
export interface GenerationStats {
  total_time_ms: number;
  claude_usage: ClaudeUsageStats;
  validation_passed: boolean;
}
