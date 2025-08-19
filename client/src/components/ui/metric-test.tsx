import * as React from "react"
import { MetricCard } from "./metric-card"
import { BenchmarkLegend } from "./benchmark-legend"

export function MetricTest() {
  const testMetrics = {
    gross_margin: 0.35,
    net_margin: 0.18,
    current_ratio: 1.8,
    debt_to_equity: 0.6,
    ar_days: 45,
    ap_days: 60,
    inventory_turns: 8.5,
    ccc_days: 75,
    revenue_cagr_3y: 0.22,
    ebitda_margin: 0.28
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Enhanced MetricCard Demo</h1>
        <p className="text-lg text-muted-foreground">
          Demonstrating industry benchmarks, color-coded status indicators, and detailed tooltips
        </p>
      </div>

      <BenchmarkLegend />

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Sample Financial Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(testMetrics).map(([key, value]) => (
            <MetricCard
              key={key}
              metricId={key}
              label={key.replace(/_/g, ' ')}
              value={typeof value === 'number' ? 
                (key.includes('margin') || key.includes('cagr') ? `${(value * 100).toFixed(1)}%` :
                 key.includes('ratio') || key.includes('turns') ? `${value.toFixed(1)}x` :
                 key.includes('days') ? `${Math.round(value)} days` : value.toFixed(2)) : 
                String(value)
              }
              className="w-full"
            />
          ))}
        </div>
      </div>

      <div className="mt-12 bg-muted/30 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Features Demonstrated:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Industry Benchmarks</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Excellent, Good, Average, Poor performance levels</li>
              <li>• Based on S&P 500, Russell 2000, and sector data</li>
              <li>• Automatic status determination</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Enhanced Tooltips</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Calculation methodology</li>
              <li>• Data sources and transparency</li>
              <li>• Benchmark comparisons</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Visual Indicators</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Color-coded status badges</li>
              <li>• Trending arrows (up/down vs industry)</li>
              <li>• Performance level indicators</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Trust Building</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Transparent data sources</li>
              <li>• Clear calculation explanations</li>
              <li>• Industry-standard comparisons</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Hover over any metric card to see the enhanced tooltip with benchmark information
        </p>
      </div>
    </div>
  );
}
