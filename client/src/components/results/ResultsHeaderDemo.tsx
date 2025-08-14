import React from 'react';
import { ResultsHeader } from './ResultsHeader';
import { SummaryReport } from '../../../../shared/src/types/SummaryReport';

// Mock data for testing
const mockSummaryReport: SummaryReport = {
  health_score: {
    overall: 75,
    components: {
      profitability: 80,
      growth: 85,
      liquidity: 70,
      leverage: 40,
      efficiency: 75,
      data_quality: 90
    },
    methodology: 'Weighted average of financial health indicators'
  },
  traffic_lights: {
    revenue_quality: {
      status: 'green',
      score: 85,
      reasoning: 'Strong revenue growth with consistent patterns',
      evidence: [{ type: 'metric', ref: 'revenue_cagr_3y', confidence: 0.9 }]
    },
    margin_trends: {
      status: 'yellow',
      score: 65,
      reasoning: 'Gross margins strong but net margins declining',
      evidence: [{ type: 'metric', ref: 'gross_margin', confidence: 0.85 }]
    },
    liquidity: {
      status: 'green',
      score: 80,
      reasoning: 'Healthy current ratio and working capital',
      evidence: [{ type: 'metric', ref: 'current_ratio', confidence: 0.8 }]
    },
    leverage: {
      status: 'red',
      score: 35,
      reasoning: 'High debt-to-equity ratio exceeds benchmarks',
      evidence: [{ type: 'metric', ref: 'debt_to_equity', confidence: 0.95 }]
    },
    working_capital: {
      status: 'yellow',
      score: 60,
      reasoning: 'Working capital adequate but could be improved',
      evidence: [{ type: 'metric', ref: 'working_capital_ratio', confidence: 0.7 }]
    },
    data_quality: {
      status: 'green',
      score: 90,
      reasoning: 'Complete financial data with minimal gaps',
      evidence: [{ type: 'metric', ref: 'data_completeness', confidence: 0.9 }]
    }
  },
  top_strengths: [
    {
      title: 'Strong Revenue Growth',
      description: 'Consistent 15% year-over-year revenue growth with expanding customer base',
      impact: 'high',
      urgency: 'long_term',
      evidence: [{ type: 'metric', ref: 'revenue_cagr_3y', confidence: 0.9 }],
      quantified_impact: '15% annual revenue growth'
    },
    {
      title: 'Healthy Gross Margins',
      description: 'Maintained 45% gross margins through operational efficiency',
      impact: 'high',
      urgency: 'long_term',
      evidence: [{ type: 'metric', ref: 'gross_margin', confidence: 0.85 }],
      quantified_impact: '45% gross margin stability'
    },
    {
      title: 'Strong Cash Position',
      description: 'Adequate cash reserves for operational needs and growth',
      impact: 'medium',
      urgency: 'near_term',
      evidence: [{ type: 'metric', ref: 'cash_ratio', confidence: 0.8 }],
      quantified_impact: '6 months of operating expenses covered'
    }
  ],
  top_risks: [
    {
      title: 'High Debt Levels',
      description: 'Debt-to-equity ratio of 2.5x exceeds industry benchmarks',
      impact: 'high',
      urgency: 'immediate',
      evidence: [{ type: 'metric', ref: 'debt_to_equity', confidence: 0.95 }],
      quantified_impact: '2.5x debt-to-equity ratio'
    },
    {
      title: 'Declining Net Margins',
      description: 'Net margins decreased from 12% to 8% over 3 years',
      impact: 'medium',
      urgency: 'near_term',
      evidence: [{ type: 'metric', ref: 'net_margin', confidence: 0.8 }],
      quantified_impact: '4% margin decline'
    },
    {
      title: 'Customer Concentration',
      description: 'Top 3 customers represent 40% of total revenue',
      impact: 'medium',
      urgency: 'long_term',
      evidence: [{ type: 'metric', ref: 'customer_concentration', confidence: 0.7 }],
      quantified_impact: '40% revenue concentration'
    }
  ],
  recommendation: {
    decision: 'Caution',
    confidence: 0.85,
    rationale: 'While the company shows strong revenue growth and operational efficiency, high debt levels and declining net margins require careful consideration. Recommend proceeding with enhanced due diligence and protective deal terms.',
    key_factors: [
      'Strong revenue growth (15% CAGR)',
      'High debt-to-equity ratio (2.5x)',
      'Declining net margins (12% to 8%)',
      'Healthy cash position and gross margins'
    ],
    valuation_impact: 'Consider 10-15% discount for debt risk and margin pressure',
    deal_structure_notes: 'Include debt reduction requirements and performance milestones'
  },
  analysis_metadata: {
    period_range: {
      start: '2021-01-01',
      end: '2023-12-31',
      total_periods: 12
    },
    data_quality: {
      completeness: 0.95,
      consistency: 0.9,
      recency: 1.0,
      missing_periods: [],
      data_gaps: ['Q2 2022 - minor data inconsistencies'],
      reliability_notes: ['Financial statements audited', 'Data source verified']
    },
    assumptions: [
      'Revenue growth continues at current pace',
      'No major market disruptions',
      'Management team remains stable'
    ],
    limitations: [
      'Limited forward-looking projections',
      'Industry comparison data limited',
      'Seasonal variations not fully analyzed'
    ],
    followup_questions: [
      'What is the debt repayment schedule?',
      'How will you address declining net margins?',
      'What is the customer acquisition strategy?',
      'Are there any pending legal or regulatory issues?'
    ]
  },
  confidence: {
    overall: 0.85,
    sections: {
      financial_metrics: 0.9,
      risk_assessment: 0.8,
      growth_projection: 0.7,
      market_analysis: 0.6
    },
    reliability_factors: [
      'Audited financial statements',
      'Consistent data patterns',
      'Multiple data sources',
      'Industry benchmarks available'
    ]
  },
  export_ready: {
    pdf_title: 'Financial Analysis Report',
    executive_summary: 'Comprehensive financial health assessment with key insights and recommendations.',
    key_metrics_table: [
      {
        metric: 'Revenue Growth',
        value: '15% CAGR',
        trend: 'improving',
        benchmark: 'Industry: 8%'
      },
      {
        metric: 'Gross Margin',
        value: '45%',
        trend: 'stable',
        benchmark: 'Industry: 42%'
      },
      {
        metric: 'Debt-to-Equity',
        value: '2.5x',
        trend: 'declining',
        benchmark: 'Industry: 1.8x'
      }
    ]
  }
};

export function ResultsHeaderDemo() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">ResultsHeader Component Demo</h1>
      
      {/* Loading State */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Loading State</h2>
        <ResultsHeader isLoading={true} summaryReport={null} />
      </div>

      {/* Error State */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Error State</h2>
        <ResultsHeader error="Failed to load analysis data" summaryReport={null} />
      </div>

      {/* No Data State */}
      <div>
        <h2 className="text-lg font-semibold mb-3">No Data State</h2>
        <ResultsHeader summaryReport={null} />
      </div>

      {/* With Data */}
      <div>
        <h2 className="text-lg font-semibold mb-3">With Analysis Data</h2>
        <ResultsHeader summaryReport={mockSummaryReport} />
      </div>
    </div>
  );
}
