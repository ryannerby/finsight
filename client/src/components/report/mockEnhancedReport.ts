import { SummaryReport } from '../../../../shared/src/types';

export const mockEnhancedReport: SummaryReport = {
  health_score: {
    overall: 72,
    components: {
      profitability: 78,
      growth: 65,
      liquidity: 85,
      leverage: 60,
      efficiency: 70,
      data_quality: 75
    },
    methodology: "Weighted average of 6 key financial health indicators: profitability (25%), growth (20%), liquidity (20%), leverage (15%), efficiency (15%), data quality (5%)"
  },
  
  traffic_lights: {
    revenue_quality: {
      status: 'yellow',
      score: 65,
      reasoning: "Revenue growth is positive but inconsistent quarter-to-quarter, with some seasonality concerns",
      evidence: [
        {
          type: 'metric',
          ref: 'revenue_growth_yoy',
          value: 12.5,
          confidence: 0.9,
          context: "Year-over-year revenue growth rate"
        },
        {
          type: 'metric',
          ref: 'revenue_volatility',
          value: 0.18,
          confidence: 0.8,
          context: "Quarterly revenue volatility measure"
        }
      ]
    },
    margin_trends: {
      status: 'green',
      score: 82,
      reasoning: "Gross margins are stable and net margins show consistent improvement over the last 3 years",
      evidence: [
        {
          type: 'metric',
          ref: 'gross_margin_ttm',
          value: 0.42,
          confidence: 0.95,
          context: "Trailing twelve months gross margin"
        },
        {
          type: 'metric',
          ref: 'net_margin_trend',
          value: 'improving',
          confidence: 0.9,
          context: "Net margin trend analysis"
        }
      ]
    },
    liquidity: {
      status: 'green',
      score: 85,
      reasoning: "Strong current ratio and healthy working capital position with good cash conversion cycle",
      evidence: [
        {
          type: 'metric',
          ref: 'current_ratio',
          value: 2.1,
          confidence: 0.95,
          context: "Current assets to current liabilities ratio"
        },
        {
          type: 'metric',
          ref: 'working_capital',
          value: 1250000,
          confidence: 0.9,
          context: "Working capital in dollars"
        }
      ]
    },
    leverage: {
      status: 'yellow',
      score: 60,
      reasoning: "Debt-to-equity ratio is acceptable but interest coverage has declined slightly",
      evidence: [
        {
          type: 'metric',
          ref: 'debt_to_equity',
          value: 0.45,
          confidence: 0.9,
          context: "Total debt to total equity ratio"
        },
        {
          type: 'metric',
          ref: 'interest_coverage',
          value: 3.2,
          confidence: 0.85,
          context: "EBIT to interest expense ratio"
        }
      ]
    },
    working_capital: {
      status: 'green',
      score: 78,
      reasoning: "Efficient inventory management and reasonable days sales outstanding",
      evidence: [
        {
          type: 'metric',
          ref: 'inventory_turnover',
          value: 8.5,
          confidence: 0.9,
          context: "Cost of goods sold to average inventory"
        },
        {
          type: 'metric',
          ref: 'days_sales_outstanding',
          value: 35,
          confidence: 0.85,
          context: "Average collection period for receivables"
        }
      ]
    },
    data_quality: {
      status: 'yellow',
      score: 75,
      reasoning: "Good data completeness but some consistency issues in quarterly reporting",
      evidence: [
        {
          type: 'metric',
          ref: 'data_completeness',
          value: 0.88,
          confidence: 0.9,
          context: "Percentage of expected data points available"
        },
        {
          type: 'metric',
          ref: 'data_consistency',
          value: 0.72,
          confidence: 0.8,
          context: "Consistency score across reporting periods"
        }
      ]
    }
  },
  
  top_strengths: [
    {
      title: "Strong Profitability Margins",
      description: "Consistent gross margins above 40% and improving net margins demonstrate strong pricing power and cost control",
      impact: 'high',
      urgency: 'long_term',
      evidence: [
        {
          type: 'metric',
          ref: 'gross_margin_ttm',
          value: 0.42,
          confidence: 0.95,
          context: "Trailing twelve months gross margin"
        }
      ],
      quantified_impact: "15% margin improvement opportunity through operational efficiency gains"
    },
    {
      title: "Healthy Liquidity Position",
      description: "Strong current ratio and working capital provide financial flexibility for growth initiatives",
      impact: 'high',
      urgency: 'long_term',
      evidence: [
        {
          type: 'metric',
          ref: 'current_ratio',
          value: 2.1,
          confidence: 0.95,
          context: "Current assets to current liabilities ratio"
        }
      ],
      quantified_impact: "Ability to fund $2M+ in growth investments without external financing"
    },
    {
      title: "Efficient Operations",
      description: "High inventory turnover and reasonable collection periods indicate well-managed operations",
      impact: 'medium',
      urgency: 'long_term',
      evidence: [
        {
          type: 'metric',
          ref: 'inventory_turnover',
          value: 8.5,
          confidence: 0.9,
          context: "Inventory turnover ratio"
        }
      ],
      quantified_impact: "5-10% working capital optimization potential"
    }
  ],
  
  top_risks: [
    {
      title: "Revenue Growth Volatility",
      description: "Inconsistent quarterly revenue growth patterns suggest potential customer concentration or market sensitivity",
      impact: 'high',
      urgency: 'near_term',
      evidence: [
        {
          type: 'metric',
          ref: 'revenue_volatility',
          value: 0.18,
          confidence: 0.8,
          context: "Quarterly revenue volatility measure"
        }
      ],
      quantified_impact: "Potential 10-15% revenue downside in weak quarters"
    },
    {
      title: "Declining Interest Coverage",
      description: "Interest coverage ratio has decreased from 4.2x to 3.2x over the last 2 years",
      impact: 'medium',
      urgency: 'near_term',
      evidence: [
        {
          type: 'metric',
          ref: 'interest_coverage',
          value: 3.2,
          confidence: 0.85,
          context: "EBIT to interest expense ratio"
        }
      ],
      quantified_impact: "Limited debt capacity for future growth initiatives"
    },
    {
      title: "Data Quality Concerns",
      description: "Some inconsistencies in quarterly financial reporting could impact analysis accuracy",
      impact: 'medium',
      urgency: 'long_term',
      evidence: [
        {
          type: 'metric',
          ref: 'data_consistency',
          value: 0.72,
          confidence: 0.8,
          context: "Data consistency score"
        }
      ],
      quantified_impact: "Potential 5-10% error margin in financial projections"
    }
  ],
  
  recommendation: {
    decision: 'Caution',
    confidence: 0.78,
    rationale: "While the company shows strong profitability and liquidity fundamentals, revenue volatility and declining interest coverage warrant a cautious approach. The business has solid operational efficiency but may face challenges in maintaining consistent growth.",
    key_factors: [
      "Strong profitability margins (42% gross margin) provide financial stability",
      "Revenue growth volatility (18% quarterly variation) indicates market sensitivity",
      "Healthy liquidity position (2.1x current ratio) offers financial flexibility",
      "Declining interest coverage (3.2x) limits debt capacity for growth"
    ],
    valuation_impact: "Recommend 10-15% discount to comparable company multiples due to growth volatility concerns",
    deal_structure_notes: "Consider earnout structures tied to revenue stability metrics and include financial covenants around debt ratios"
  },
  
  analysis_metadata: {
    period_range: {
      start: "2022-01-01",
      end: "2024-12-31",
      total_periods: 12
    },
    data_quality: {
      completeness: 0.88,
      consistency: 0.72,
      recency: 0.95,
      missing_periods: ["2023-Q2"],
      data_gaps: ["Some quarterly breakdowns missing for 2023"],
      reliability_notes: [
        "Financial data available for 11 out of 12 expected quarters",
        "Quarterly consistency varies due to reporting format changes in 2023",
        "Most recent data is current as of December 2024"
      ]
    },
    assumptions: [
      "Historical trends will continue in the near term",
      "No major changes in business model or market conditions",
      "Management maintains current operational efficiency levels"
    ],
    limitations: [
      "Limited forward-looking guidance from management",
      "Some quarterly data missing for 2023 period",
      "Industry benchmarks may not reflect current market conditions"
    ],
    followup_questions: [
      "What factors contribute to quarterly revenue volatility?",
      "Are there plans to improve interest coverage ratios?",
      "How does management plan to maintain margin levels?",
      "What is the customer concentration profile?",
      "Are there any pending regulatory or market changes?"
    ]
  },
  
  confidence: {
    overall: 0.78,
    sections: {
      profitability: 0.9,
      growth: 0.7,
      liquidity: 0.9,
      leverage: 0.8,
      efficiency: 0.85,
      data_quality: 0.75
    },
    reliability_factors: [
      "High confidence in profitability metrics due to consistent reporting",
      "Moderate confidence in growth analysis due to missing quarterly data",
      "Strong confidence in liquidity metrics with complete data",
      "Good confidence in leverage analysis with recent debt information"
    ]
  },
  
  export_ready: {
    pdf_title: "Financial Health Analysis Report - Company XYZ",
    executive_summary: "Company XYZ demonstrates strong profitability and liquidity fundamentals with a 72/100 health score. While operational efficiency is good, revenue volatility and declining interest coverage warrant a cautious investment approach. The business has solid foundations but may face challenges in maintaining consistent growth.",
    key_metrics_table: [
      {
        metric: "Overall Health Score",
        value: "72/100",
        trend: "stable",
        benchmark: "Industry Average: 65"
      },
      {
        metric: "Gross Margin (TTM)",
        value: "42%",
        trend: "stable",
        benchmark: "Industry Average: 38%"
      },
      {
        metric: "Current Ratio",
        value: "2.1x",
        trend: "stable",
        benchmark: "Industry Average: 1.8x"
      },
      {
        metric: "Revenue Growth (YoY)",
        value: "12.5%",
        trend: "volatile",
        benchmark: "Industry Average: 8.2%"
      }
    ]
  }
};
