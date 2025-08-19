import * as React from "react"
import { MetricCard } from "./metric-card"
import { BenchmarkLegend } from "./benchmark-legend"
import { FINANCIAL_BENCHMARKS } from "../../../../shared/src/constants/financialBenchmarks"

export interface ComprehensiveMetricsProps {
  metrics: Record<string, any>
  className?: string
  showLegend?: boolean
}

export function ComprehensiveMetrics({ metrics, className, showLegend = true }: ComprehensiveMetricsProps) {
  // Group metrics by category
  const metricCategories = {
    profitability: ['gross_margin', 'net_margin', 'ebitda_margin'],
    liquidity: ['current_ratio', 'quick_ratio'],
    leverage: ['debt_to_equity'],
    efficiency: ['ar_days', 'ap_days', 'inventory_turns', 'ccc_days'],
    growth: ['revenue_cagr_3y', 'seasonality_volatility_index'],
    workingCapital: ['wc_to_sales']
  };

  // Filter to only show metrics that have values
  const availableMetrics = Object.keys(metrics).filter(key => 
    metrics[key] != null && typeof metrics[key] === 'number' && !Number.isNaN(metrics[key])
  );

  // Helper function to format metric values
  const formatMetric = (key: string, val: number): string => {
    if (val == null || Number.isNaN(val)) return 'n/a';
    const asPct = (n: number) => `${(n * 100).toFixed(1)}%`;
    const asX = (n: number) => `${n.toFixed(2)}x`;
    const asDays = (n: number) => `${Math.round(n)} days`;
    
    if (['gross_margin','net_margin','ebitda_margin','revenue_cagr_3y','wc_to_sales'].includes(key)) return asPct(val);
    if (['current_ratio','quick_ratio','debt_to_equity','inventory_turns'].includes(key)) return asX(val);
    if (['ar_days','ap_days','dio_days','ccc_days'].includes(key)) return asDays(val);
    return String(val.toFixed(3));
  };

  // Get category title
  const getCategoryTitle = (category: string): string => {
    const titles: Record<string, string> = {
      profitability: 'Profitability Metrics',
      liquidity: 'Liquidity Metrics',
      leverage: 'Leverage Metrics',
      efficiency: 'Efficiency Metrics',
      growth: 'Growth Metrics',
      workingCapital: 'Working Capital Metrics'
    };
    return titles[category] || category;
  };

  // Check if category has any available metrics
  const hasMetricsInCategory = (category: string): boolean => {
    return metricCategories[category as keyof typeof metricCategories]?.some(metric => 
      availableMetrics.includes(metric)
    ) || false;
  };

  // Get responsive grid columns based on metric count
  const getGridColumns = (count: number): string => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 sm:grid-cols-2';
    if (count === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    if (count === 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5';
  };

  return (
    <div className={className}>
      {showLegend && (
        <div className="mb-4">
          <BenchmarkLegend />
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(metricCategories).map(([category, metricKeys]) => {
          const availableInCategory = metricKeys.filter(metric => availableMetrics.includes(metric));
          
          if (availableInCategory.length === 0) return null;

          return (
            <div key={category} className="w-full max-w-6xl mx-auto mb-4">
              <h4 className="text-sm font-semibold text-muted-foreground mb-2 text-center uppercase tracking-wide">
                {getCategoryTitle(category)}
              </h4>
              
              {/* Mobile: swipeable */}
              <div className="flex gap-1.5 overflow-x-auto sm:hidden -mx-4 px-4 snap-x pb-2 scrollbar-hide">
                {availableInCategory.map((metricKey) => (
                  <MetricCard
                    key={`${category}-${metricKey}`}
                    metricId={metricKey}
                    label={metricKey.replace(/_/g,' ')}
                    value={formatMetric(metricKey, metrics[metricKey])}
                    tooltip={`Computed ${metricKey.replace(/_/g,' ')}`}
                    ariaLabel={`${metricKey} metric`}
                    className="min-h-[80px] snap-start flex-shrink-0"
                  />
                ))}
              </div>
              
              {/* Desktop: responsive grid */}
              <div className={`hidden sm:grid gap-2 ${getGridColumns(availableInCategory.length)}`}>
                {availableInCategory.map((metricKey) => (
                  <MetricCard
                    key={metricKey}
                    metricId={metricKey}
                    label={metricKey.replace(/_/g,' ')}
                    value={formatMetric(metricKey, metrics[metricKey])}
                    tooltip={`Computed ${metricKey.replace(/_/g,' ')}`}
                    ariaLabel={`${metricKey} metric`}
                    className="min-h-[80px] w-full"
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Metrics coverage summary */}
      <div className="mt-4 w-full max-w-6xl mx-auto">
        <div className="bg-muted/30 rounded-lg p-2.5 border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1.5">
            <h5 className="text-sm font-medium">Metrics Coverage</h5>
            <span className="text-xs text-muted-foreground">
              {availableMetrics.length} of {Object.keys(FINANCIAL_BENCHMARKS).length} metrics available
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
            <div 
              className="bg-primary h-1 rounded-full transition-all duration-300"
              style={{ width: `${(availableMetrics.length / Object.keys(FINANCIAL_BENCHMARKS).length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-center sm:text-left">
            {availableMetrics.length === 0 
              ? 'No financial metrics available. Upload financial statements to see analysis.'
              : `Showing ${availableMetrics.length} computed financial metrics with industry benchmarks.`
            }
          </p>
        </div>
      </div>
    </div>
  );
}
