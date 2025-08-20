import * as React from "react"
import { MetricCard } from "./metric-card"
import { BenchmarkLegend } from "./benchmark-legend"

export function MetricDemo() {
  const demoMetrics = {
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
    <div className="p-6 space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Enhanced MetricCard Demo</h2>
        <p className="text-muted-foreground">
          Demonstrating industry benchmarks, color-coded status indicators, and detailed tooltips
        </p>
      </div>

      <BenchmarkLegend />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {Object.entries(demoMetrics).map(([key, value]) => (
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

      <div className="bg-muted/30 rounded-lg p-4 max-w-4xl mx-auto">
        <h3 className="font-semibold mb-2">Features Demonstrated:</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Industry benchmark ranges (Excellent, Good, Average, Poor)</li>
          <li>• Color-coded status indicators based on benchmark thresholds</li>
          <li>• Hover tooltips showing calculation methodology and data sources</li>
          <li>• Visual trend indicators (trending up/down vs industry average)</li>
          <li>• Benchmark badges showing performance level</li>
        </ul>
      </div>
    </div>
  );
}
