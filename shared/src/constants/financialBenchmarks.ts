// Industry benchmark ranges for financial metrics
// These ranges help users quickly assess if metrics are good/bad relative to industry standards

export interface BenchmarkRange {
  excellent: number;
  good: number;
  average: number;
  poor: number;
  unit: string;
  description: string;
  calculation: string;
  dataSource: string;
}

export const FINANCIAL_BENCHMARKS: Record<string, BenchmarkRange> = {
  // Profitability Metrics
  gross_margin: {
    excellent: 0.40, // 40%
    good: 0.30,      // 30%
    average: 0.20,   // 20%
    poor: 0.10,      // 10%
    unit: "percentage",
    description: "Gross profit as a percentage of revenue. Higher margins indicate better pricing power and cost control.",
    calculation: "(Revenue - Cost of Goods Sold) / Revenue",
    dataSource: "Industry averages from S&P 500, Russell 2000, and sector-specific data"
  },
  
  net_margin: {
    excellent: 0.20, // 20%
    good: 0.15,      // 15%
    average: 0.10,   // 10%
    poor: 0.05,      // 5%
    unit: "percentage",
    description: "Net income as a percentage of revenue. Measures overall profitability after all expenses.",
    calculation: "Net Income / Revenue",
    dataSource: "Industry averages from S&P 500, Russell 2000, and sector-specific data"
  },
  
  ebitda_margin: {
    excellent: 0.25, // 25%
    good: 0.20,      // 20%
    average: 0.15,   // 15%
    poor: 0.10,      // 10%
    unit: "percentage",
    description: "EBITDA as a percentage of revenue. Measures operational profitability before interest, taxes, depreciation, and amortization.",
    calculation: "EBITDA / Revenue",
    dataSource: "Industry averages from S&P 500, Russell 2000, and sector-specific data"
  },

  // Liquidity Metrics
  current_ratio: {
    excellent: 2.0,  // 2.0x
    good: 1.5,       // 1.5x
    average: 1.0,    // 1.0x
    poor: 0.8,       // 0.8x
    unit: "ratio",
    description: "Ability to pay short-term obligations with current assets. Higher ratios indicate better liquidity.",
    calculation: "Current Assets / Current Liabilities",
    dataSource: "Industry averages from S&P 500, Russell 2000, and sector-specific data"
  },
  
  quick_ratio: {
    excellent: 1.5,  // 1.5x
    good: 1.0,       // 1.0x
    average: 0.8,    // 0.8x
    poor: 0.5,       // 0.5x
    unit: "ratio",
    description: "Ability to pay short-term obligations with most liquid assets (excluding inventory).",
    calculation: "(Cash + Marketable Securities + Accounts Receivable) / Current Liabilities",
    dataSource: "Industry averages from S&P 500, Russell 2000, and sector-specific data"
  },

  // Leverage Metrics
  debt_to_equity: {
    excellent: 0.3,  // 0.3x
    good: 0.5,       // 0.5x
    average: 1.0,    // 1.0x
    poor: 2.0,       // 2.0x
    unit: "ratio",
    description: "Total debt relative to shareholders' equity. Lower ratios indicate less financial risk.",
    calculation: "Total Debt / Shareholders' Equity",
    dataSource: "Industry averages from S&P 500, Russell 2000, and sector-specific data"
  },

  // Efficiency Metrics
  ar_days: {
    excellent: 30,   // 30 days
    good: 45,        // 45 days
    average: 60,     // 60 days
    poor: 90,        // 90 days
    unit: "days",
    description: "Days Sales Outstanding - average time to collect receivables. Lower is better.",
    calculation: "(Accounts Receivable / Revenue) × Period Days",
    dataSource: "Industry averages from S&P 500, Russell 2000, and sector-specific data"
  },
  
  ap_days: {
    excellent: 45,   // 45 days
    good: 60,        // 60 days
    average: 75,     // 75 days
    poor: 90,        // 90 days
    unit: "days",
    description: "Days Payable Outstanding - average time to pay suppliers. Higher can indicate better cash management.",
    calculation: "(Accounts Payable / Cost of Goods Sold) × Period Days",
    dataSource: "Industry averages from S&P 500, Russell 2000, and sector-specific data"
  },
  
  inventory_turns: {
    excellent: 12,   // 12x per year
    good: 8,         // 8x per year
    average: 6,      // 6x per year
    poor: 4,         // 4x per year
    unit: "turns per year",
    description: "Inventory turnover rate. Higher rates indicate better inventory management.",
    calculation: "Cost of Goods Sold / Average Inventory × (365 / Period Days)",
    dataSource: "Industry averages from S&P 500, Russell 2000, and sector-specific data"
  },

  // Growth Metrics
  revenue_cagr_3y: {
    excellent: 0.25, // 25% annual growth
    good: 0.15,      // 15% annual growth
    average: 0.08,   // 8% annual growth
    poor: 0.02,      // 2% annual growth
    unit: "annual percentage",
    description: "Compound Annual Growth Rate over 3 years. Higher growth indicates expanding business.",
    calculation: "(Final Revenue / Initial Revenue)^(1/3) - 1",
    dataSource: "Industry averages from S&P 500, Russell 2000, and sector-specific data"
  },

  // Working Capital Metrics
  ccc_days: {
    excellent: 30,   // 30 days
    good: 60,        // 60 days
    average: 90,     // 90 days
    poor: 120,       // 120 days
    unit: "days",
    description: "Cash Conversion Cycle - time from paying suppliers to collecting from customers. Lower is better.",
    calculation: "AR Days + Inventory Days - AP Days",
    dataSource: "Industry averages from S&P 500, Russell 2000, and sector-specific data"
  },
  
  wc_to_sales: {
    excellent: 0.10, // 10%
    good: 0.15,      // 15%
    average: 0.25,   // 25%
    poor: 0.40,      // 40%
    unit: "percentage",
    description: "Working capital as a percentage of sales. Lower ratios indicate more efficient working capital management.",
    calculation: "(Current Assets - Current Liabilities) / Revenue",
    dataSource: "Industry averages from S&P 500, Russell 2000, and sector-specific data"
  }
};

// Helper function to get benchmark status for a metric
export function getBenchmarkStatus(metricId: string, value: number): 'excellent' | 'good' | 'average' | 'poor' | 'unknown' {
  const benchmark = FINANCIAL_BENCHMARKS[metricId];
  if (!benchmark) return 'unknown';
  
  if (value >= benchmark.excellent) return 'excellent';
  if (value >= benchmark.good) return 'good';
  if (value >= benchmark.average) return 'average';
  if (value >= benchmark.poor) return 'poor';
  return 'poor';
}

// Helper function to get color for benchmark status
export function getBenchmarkColor(status: 'excellent' | 'good' | 'average' | 'poor' | 'unknown'): string {
  switch (status) {
    case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
    case 'good': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    case 'average': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'poor': return 'text-red-600 bg-red-50 border-red-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

// Helper function to get status indicator color
export function getStatusColor(status: 'excellent' | 'good' | 'average' | 'poor' | 'unknown'): 'green' | 'yellow' | 'red' | 'neutral' {
  switch (status) {
    case 'excellent': return 'green';
    case 'good': return 'green';
    case 'average': return 'yellow';
    case 'poor': return 'red';
    default: return 'neutral';
  }
}
