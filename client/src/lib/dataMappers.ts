import { SummaryReport, Evidence, TrafficLight, StrengthRisk } from '../../../shared/src/types';

// UI Models - Clean, non-nullable interfaces for components
export interface UIHealthScore {
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
}

export interface UITrafficLight {
  status: 'green' | 'yellow' | 'red';
  score: number;
  reasoning: string;
  evidence: UIEvidence[];
}

export interface UIEvidence {
  type: 'metric' | 'excerpt' | 'calculation';
  ref: string;
  value?: string | number;
  document_id?: string;
  page?: number;
  quote?: string;
  confidence: number;
  context?: string;
}

export interface UIStrengthRisk {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  urgency?: 'immediate' | 'near_term' | 'long_term';
  evidence: UIEvidence[];
  quantified_impact?: string;
}

export interface UIRecommendation {
  decision: 'Proceed' | 'Caution' | 'Pass';
  confidence: number;
  rationale: string;
  key_factors: string[];
  valuation_impact?: string;
  deal_structure_notes?: string;
}

export interface UISummaryReport {
  health_score: UIHealthScore;
  traffic_lights: Record<string, UITrafficLight>;
  top_strengths: UIStrengthRisk[];
  top_risks: UIStrengthRisk[];
  recommendation: UIRecommendation;
  analysis_metadata?: {
    period_range: {
      start: string;
      end: string;
      total_periods: number;
    };
    data_quality: {
      completeness: number;
      consistency: number;
      recency: number;
      missing_periods: string[];
      data_gaps: string[];
      reliability_notes: string[];
    };
    assumptions: string[];
    limitations: string[];
    followup_questions: string[];
  };
  confidence?: {
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

// Data transformation functions
export function mapEvidenceToUI(evidence: Evidence): UIEvidence {
  return {
    type: evidence.type,
    ref: evidence.ref,
    value: evidence.value,
    document_id: evidence.document_id,
    page: evidence.page,
    quote: evidence.quote,
    confidence: evidence.confidence,
    context: evidence.context
  };
}

export function mapTrafficLightToUI(trafficLight: TrafficLight): UITrafficLight {
  return {
    status: trafficLight.status,
    score: trafficLight.score,
    reasoning: trafficLight.reasoning,
    evidence: trafficLight.evidence.map(mapEvidenceToUI)
  };
}

export function mapStrengthRiskToUI(strengthRisk: StrengthRisk): UIStrengthRisk {
  return {
    title: strengthRisk.title,
    description: strengthRisk.description,
    impact: strengthRisk.impact,
    urgency: strengthRisk.urgency,
    evidence: strengthRisk.evidence.map(mapEvidenceToUI),
    quantified_impact: strengthRisk.quantified_impact
  };
}

export function mapSummaryReportToUI(summaryReport: SummaryReport | null | undefined): UISummaryReport | null {
  if (!summaryReport) {
    return null;
  }

  try {
    return {
      health_score: {
        overall: summaryReport.health_score.overall,
        components: {
          profitability: summaryReport.health_score.components.profitability,
          growth: summaryReport.health_score.components.growth,
          liquidity: summaryReport.health_score.components.liquidity,
          leverage: summaryReport.health_score.components.leverage,
          efficiency: summaryReport.health_score.components.efficiency,
          data_quality: summaryReport.health_score.components.data_quality
        },
        methodology: summaryReport.health_score.methodology
      },
      traffic_lights: {
        revenue_quality: mapTrafficLightToUI(summaryReport.traffic_lights.revenue_quality),
        margin_trends: mapTrafficLightToUI(summaryReport.traffic_lights.margin_trends),
        liquidity: mapTrafficLightToUI(summaryReport.traffic_lights.liquidity),
        leverage: mapTrafficLightToUI(summaryReport.traffic_lights.leverage),
        working_capital: mapTrafficLightToUI(summaryReport.traffic_lights.working_capital),
        data_quality: mapTrafficLightToUI(summaryReport.traffic_lights.data_quality)
      },
      top_strengths: summaryReport.top_strengths.map(mapStrengthRiskToUI),
      top_risks: summaryReport.top_risks.map(mapStrengthRiskToUI),
      recommendation: {
        decision: summaryReport.recommendation.decision,
        confidence: summaryReport.recommendation.confidence,
        rationale: summaryReport.recommendation.rationale,
        key_factors: summaryReport.recommendation.key_factors,
        valuation_impact: summaryReport.recommendation.valuation_impact,
        deal_structure_notes: summaryReport.recommendation.deal_structure_notes
      },
      analysis_metadata: summaryReport.analysis_metadata ? {
        period_range: summaryReport.analysis_metadata.period_range,
        data_quality: summaryReport.analysis_metadata.data_quality,
        assumptions: summaryReport.analysis_metadata.assumptions,
        limitations: summaryReport.analysis_metadata.limitations,
        followup_questions: summaryReport.analysis_metadata.followup_questions
      } : undefined,
      confidence: summaryReport.confidence ? {
        overall: summaryReport.confidence.overall,
        sections: summaryReport.confidence.sections,
        reliability_factors: summaryReport.confidence.reliability_factors
      } : undefined,
      export_ready: summaryReport.export_ready ? {
        pdf_title: summaryReport.export_ready.pdf_title,
        executive_summary: summaryReport.export_ready.executive_summary,
        key_metrics_table: summaryReport.export_ready.key_metrics_table
      } : undefined
    };
  } catch (error) {
    console.error('Error mapping summary report to UI:', error);
    return null;
  }
}

// Safe data access helpers
export function getSafeHealthScore(summaryReport: UISummaryReport | null): UIHealthScore | null {
  return summaryReport?.health_score || null;
}

export function getSafeTrafficLights(summaryReport: UISummaryReport | null): Record<string, UITrafficLight> | null {
  return summaryReport?.traffic_lights || null;
}

export function getSafeStrengths(summaryReport: UISummaryReport | null): UIStrengthRisk[] {
  return summaryReport?.top_strengths || [];
}

export function getSafeRisks(summaryReport: UISummaryReport | null): UIStrengthRisk[] {
  return summaryReport?.top_risks || [];
}

export function getSafeRecommendation(summaryReport: UISummaryReport | null): UIRecommendation | null {
  return summaryReport?.recommendation || null;
}

// Data validation helpers
export function hasValidData(summaryReport: UISummaryReport | null): boolean {
  if (!summaryReport) return false;
  
  return (
    summaryReport.health_score.overall > 0 &&
    summaryReport.top_strengths.length > 0 &&
    summaryReport.top_risks.length > 0 &&
    summaryReport.recommendation.decision !== undefined
  );
}

export function getDataCompleteness(summaryReport: UISummaryReport | null): number {
  if (!summaryReport) return 0;
  
  let totalFields = 0;
  let completedFields = 0;
  
  // Health score
  totalFields += 1;
  if (summaryReport.health_score.overall > 0) completedFields += 1;
  
  // Traffic lights
  totalFields += Object.keys(summaryReport.traffic_lights).length;
  Object.values(summaryReport.traffic_lights).forEach(tl => {
    if (tl.status && tl.score > 0) completedFields += 1;
  });
  
  // Strengths and risks
  totalFields += 2;
  if (summaryReport.top_strengths.length > 0) completedFields += 1;
  if (summaryReport.top_risks.length > 0) completedFields += 1;
  
  // Recommendation
  totalFields += 1;
  if (summaryReport.recommendation.decision) completedFields += 1;
  
  return totalFields > 0 ? (completedFields / totalFields) * 100 : 0;
}
