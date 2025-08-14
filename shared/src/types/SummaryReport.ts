import { z } from 'zod';

// Evidence schema for provenance tracking
export const EvidenceSchema = z.object({
  type: z.enum(['metric', 'excerpt', 'calculation']),
  ref: z.string(), // metric key, excerpt_id, or calculation formula
  value: z.union([z.string(), z.number()]).optional(), // actual metric value
  document_id: z.string().optional(),
  page: z.number().optional(),
  quote: z.string().max(200).optional(), // Limited excerpt length
  confidence: z.number().min(0).max(1).default(1),
  context: z.string().optional() // Additional context for interpretation
});

// Traffic light with reasoning
export const TrafficLightSchema = z.object({
  status: z.enum(['green', 'yellow', 'red']),
  score: z.number().min(0).max(100), // Numerical backing
  reasoning: z.string().max(300),
  evidence: z.array(EvidenceSchema).min(1).max(3)
});

// Strength/Risk with impact assessment
export const StrengthRiskSchema = z.object({
  title: z.string().max(100),
  description: z.string().max(400),
  impact: z.enum(['high', 'medium', 'low']),
  urgency: z.enum(['immediate', 'near_term', 'long_term']).optional(),
  evidence: z.array(EvidenceSchema).min(1).max(5),
  quantified_impact: z.string().optional() // e.g., "15% margin improvement opportunity"
});

// Data quality assessment
export const DataQualitySchema = z.object({
  completeness: z.number().min(0).max(1), // % of expected periods with data
  consistency: z.number().min(0).max(1), // How consistent are period-to-period changes
  recency: z.number().min(0).max(1), // How recent is the latest data
  missing_periods: z.array(z.string()),
  data_gaps: z.array(z.string()),
  reliability_notes: z.array(z.string())
});

// Enhanced main schema
export const SummaryReportSchema = z.object({
  // Core scoring
  health_score: z.object({
    overall: z.number().min(0).max(100),
    components: z.object({
      profitability: z.number().min(0).max(100),
      growth: z.number().min(0).max(100),
      liquidity: z.number().min(0).max(100),
      leverage: z.number().min(0).max(100),
      efficiency: z.number().min(0).max(100),
      data_quality: z.number().min(0).max(100)
    }),
    methodology: z.string().max(500) // Explain how score was calculated
  }),
  
  // Traffic lights with enhanced reasoning
  traffic_lights: z.object({
    revenue_quality: TrafficLightSchema,
    margin_trends: TrafficLightSchema,
    liquidity: TrafficLightSchema,
    leverage: TrafficLightSchema,
    working_capital: TrafficLightSchema,
    data_quality: TrafficLightSchema
  }),
  
  // Findings
  top_strengths: z.array(StrengthRiskSchema).min(3).max(7),
  top_risks: z.array(StrengthRiskSchema).min(3).max(7),
  
  // Decision framework
  recommendation: z.object({
    decision: z.enum(['Proceed', 'Caution', 'Pass']),
    confidence: z.number().min(0).max(1),
    rationale: z.string().max(800),
    key_factors: z.array(z.string()).min(2).max(5), // Bullet points
    valuation_impact: z.string().optional(), // How findings affect valuation
    deal_structure_notes: z.string().optional() // Suggested terms/protections
  }),
  
  // Analytics metadata
  analysis_metadata: z.object({
    period_range: z.object({
      start: z.string(),
      end: z.string(),
      total_periods: z.number()
    }),
    data_quality: DataQualitySchema,
    assumptions: z.array(z.string()).default([]),
    limitations: z.array(z.string()).default([]),
    followup_questions: z.array(z.string()).default([]) // Seed Q&A
  }),
  
  // Confidence tracking
  confidence: z.object({
    overall: z.number().min(0).max(1),
    sections: z.record(z.string(), z.number().min(0).max(1)),
    reliability_factors: z.array(z.string()) // What drives confidence up/down
  }),
  
  // Export metadata
  export_ready: z.object({
    pdf_title: z.string(),
    executive_summary: z.string().max(500), // One-paragraph overview
    key_metrics_table: z.array(z.object({
      metric: z.string(),
      value: z.string(),
      trend: z.enum(['improving', 'stable', 'declining', 'volatile']),
      benchmark: z.string().optional()
    }))
  })
});

// Legacy types for backward compatibility
export const EvidenceItem = z.object({
  id: z.string().uuid().optional(),
  evidence_type: z.enum(['financial_data', 'document_excerpt', 'calculation', 'external_source', 'assumption', 'note']),
  title: z.string().min(1, 'Evidence title is required'),
  description: z.string().optional(),
  source_document_id: z.string().uuid().optional(),
  source_page: z.number().int().positive().optional(),
  source_text: z.string().optional(),
  confidence_score: z.number().min(0).max(1).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  created_at: z.string().datetime().optional()
});

export const ReportSection = z.object({
  id: z.string().uuid().optional(),
  section_type: z.enum(['executive_summary', 'financial_analysis', 'risk_assessment', 'evidence', 'recommendations', 'appendix']),
  title: z.string().min(1, 'Section title is required'),
  content: z.string().optional(),
  order_index: z.number().int().min(0),
  is_required: z.boolean().default(true),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

export const ReportExport = z.object({
  id: z.string().uuid().optional(),
  export_format: z.enum(['pdf', 'docx', 'xlsx', 'html', 'json']),
  file_path: z.string().optional(),
  file_size: z.number().int().positive().optional(),
  generated_by: z.string(),
  generated_at: z.string().datetime().optional(),
  expires_at: z.string().datetime().optional(),
  download_count: z.number().int().min(0).default(0),
  metadata: z.record(z.string(), z.any()).optional()
});

export const ReportSharing = z.object({
  id: z.string().uuid().optional(),
  shared_with: z.string(),
  access_level: z.enum(['view', 'comment', 'edit', 'admin']).default('view'),
  shared_by: z.string(),
  shared_at: z.string().datetime().optional(),
  expires_at: z.string().datetime().optional(),
  is_active: z.boolean().default(true)
});

export const ReportComment = z.object({
  id: z.string().uuid().optional(),
  commenter_id: z.string(),
  comment: z.string().min(1, 'Comment cannot be empty'),
  parent_comment_id: z.string().uuid().optional(),
  is_resolved: z.boolean().default(false),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

export const ReportQA = z.object({
  id: z.string().uuid().optional(),
  question: z.string().min(1, 'Question cannot be empty'),
  answer: z.string().optional(),
  question_context: z.record(z.string(), z.any()).optional(),
  answer_evidence: z.record(z.string(), z.any()).optional(),
  asked_by: z.string(),
  answered_by: z.string().optional(),
  status: z.enum(['pending', 'answered', 'requires_clarification', 'archived']).default('pending'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  tags: z.array(z.string()).optional(),
  created_at: z.string().datetime().optional(),
  answered_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

export const ReportTemplate = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  template_type: z.enum(['standard', 'custom', 'industry_specific']),
  sections: z.array(z.object({
    type: z.string(),
    title: z.string(),
    required: z.boolean(),
    order: z.number()
  })),
  is_active: z.boolean().default(true),
  created_by: z.string(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

export const AnalysisReport = z.object({
  id: z.string().uuid().optional(),
  deal_id: z.string().uuid(),
  report_type: z.enum(['comprehensive', 'financial_summary', 'risk_assessment', 'due_diligence', 'custom']),
  title: z.string().min(1, 'Report title is required'),
  description: z.string().optional(),
  status: z.enum(['draft', 'in_progress', 'completed', 'archived']).default('draft'),
  generated_by: z.string(),
  generated_at: z.string().datetime().optional(),
  completed_at: z.string().datetime().optional(),
  last_modified: z.string().datetime().optional(),
  version: z.number().int().min(1).default(1),
  metadata: z.record(z.string(), z.any()).default({}),
  
  // Related data (populated when fetching full reports)
  sections: z.array(ReportSection).optional(),
  evidence_items: z.array(EvidenceItem).optional(),
  exports: z.array(ReportExport).optional(),
  sharing: z.array(ReportSharing).optional(),
  comments: z.array(ReportComment).optional(),
  qa_items: z.array(ReportQA).optional()
});

export const ReportGenerationRequest = z.object({
  deal_id: z.string().uuid(),
  report_type: z.enum(['comprehensive', 'financial_summary', 'risk_assessment', 'due_diligence', 'custom']),
  title: z.string().min(1, 'Report title is required'),
  description: z.string().optional(),
  template_id: z.string().uuid().optional(),
  custom_sections: z.array(z.string()).optional(),
  include_evidence: z.boolean().default(true),
  include_qa: z.boolean().default(true),
  export_formats: z.array(z.enum(['pdf', 'docx', 'xlsx', 'html', 'json'])).default(['pdf']),
  generated_by: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional()
});

export const ReportGenerationResponse = z.object({
  success: z.boolean(),
  report_id: z.string().uuid().optional(),
  status: z.enum(['queued', 'processing', 'completed', 'failed']),
  message: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
  estimated_completion: z.string().datetime().optional(),
  error: z.string().optional()
});

export const ReportUpdateRequest = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'in_progress', 'completed', 'archived']).optional(),
  sections: z.array(ReportSection).optional(),
  metadata: z.record(z.string(), z.any()).optional()
});

export const ReportSearchParams = z.object({
  deal_id: z.string().uuid().optional(),
  report_type: z.enum(['comprehensive', 'financial_summary', 'risk_assessment', 'due_diligence', 'custom']).optional(),
  status: z.enum(['draft', 'in_progress', 'completed', 'archived']).optional(),
  generated_by: z.string().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sort_by: z.enum(['created_at', 'updated_at', 'title', 'status']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// Enhanced types
export type SummaryReport = z.infer<typeof SummaryReportSchema>;
export type Evidence = z.infer<typeof EvidenceSchema>;
export type TrafficLight = z.infer<typeof TrafficLightSchema>;
export type StrengthRisk = z.infer<typeof StrengthRiskSchema>;
export type DataQuality = z.infer<typeof DataQualitySchema>;

// Legacy types
export type TEvidenceItem = z.infer<typeof EvidenceItem>;
export type TReportSection = z.infer<typeof ReportSection>;
export type TReportExport = z.infer<typeof ReportExport>;
export type TReportSharing = z.infer<typeof ReportSharing>;
export type TReportComment = z.infer<typeof ReportComment>;
export type TReportQA = z.infer<typeof ReportQA>;
export type TReportTemplate = z.infer<typeof ReportTemplate>;
export type TAnalysisReport = z.infer<typeof AnalysisReport>;
export type TReportGenerationRequest = z.infer<typeof ReportGenerationRequest>;
export type TReportGenerationResponse = z.infer<typeof ReportGenerationResponse>;
export type TReportUpdateRequest = z.infer<typeof ReportUpdateRequest>;
export type TReportSearchParams = z.infer<typeof ReportSearchParams>;

// Validation helpers
export const validateSummaryReport = (data: unknown): SummaryReport => {
  return SummaryReportSchema.parse(data);
};

export const isValidEvidence = (evidence: unknown): evidence is Evidence => {
  return EvidenceSchema.safeParse(evidence).success;
};
