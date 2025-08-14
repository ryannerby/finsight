// Local copy of SummaryReport type to avoid import issues
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
  
  export_ready?: {
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
