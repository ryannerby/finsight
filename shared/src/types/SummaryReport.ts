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

// Enhanced types
export type SummaryReport = z.infer<typeof SummaryReportSchema>;
export type Evidence = z.infer<typeof EvidenceSchema>;
export type TrafficLight = z.infer<typeof TrafficLightSchema>;
export type StrengthRisk = z.infer<typeof StrengthRiskSchema>;
export type DataQuality = z.infer<typeof DataQualitySchema>;

// Validation helpers
export const validateSummaryReport = (data: unknown): SummaryReport => {
  return SummaryReportSchema.parse(data);
};

export const isValidEvidence = (evidence: unknown): evidence is Evidence => {
  return EvidenceSchema.safeParse(evidence).success;
};
