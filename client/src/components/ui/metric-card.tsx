import * as React from "react"
import { cn } from "@/lib/utils"
import { Tooltip } from "./tooltip"
import { FINANCIAL_BENCHMARKS, getBenchmarkStatus, getBenchmarkColor, getStatusColor } from "../../../../shared/src/constants/financialBenchmarks"
import { Badge } from "./badge"
import { Info, TrendingUp, TrendingDown, Minus } from "lucide-react"

export interface MetricCardProps {
  label: string
  value: React.ReactNode
  metricId?: string // Used to look up benchmarks
  status?: 'good' | 'warning' | 'bad' | 'neutral'
  tooltip?: string
  className?: string
  ariaLabel?: string
  showBenchmarks?: boolean // Whether to show benchmark indicators
  loading?: boolean // Whether to show loading state
  hoverable?: boolean // Whether to show hover effects
}

export function MetricCard({ 
  label, 
  value, 
  metricId, 
  status = 'neutral', 
  tooltip, 
  className, 
  ariaLabel,
  showBenchmarks = true,
  loading = false,
  hoverable = true
}: MetricCardProps) {
  // Get benchmark data if metricId is provided
  const benchmark = metricId ? FINANCIAL_BENCHMARKS[metricId] : null;
  const numericValue = typeof value === 'number' ? value : null;
  const benchmarkStatus = numericValue && benchmark && metricId ? getBenchmarkStatus(metricId, numericValue) : null;
  
  // Use benchmark status for color coding if available, otherwise fall back to prop status
  const effectiveStatus = benchmarkStatus ? getStatusColor(benchmarkStatus) : status;
  
  const statusRing = effectiveStatus === 'good' ? 'ring-green-500/30' : 
                     effectiveStatus === 'warning' ? 'ring-yellow-500/30' : 
                     effectiveStatus === 'bad' ? 'ring-red-500/30' : 
                     'ring-[hsl(var(--secondary))]/20';

  // Create enhanced tooltip content
  const enhancedTooltip = React.useMemo(() => {
    if (!benchmark) return tooltip;
    
    return (
      <div className="max-w-sm space-y-3">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">{label}</h4>
          <p className="text-xs text-muted-foreground">{benchmark.description}</p>
        </div>
        
        {benchmarkStatus && benchmarkStatus !== 'unknown' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={cn("text-xs", getBenchmarkColor(benchmarkStatus))}
              >
                {benchmarkStatus.charAt(0).toUpperCase() + benchmarkStatus.slice(1)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                vs Industry Average
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Excellent:</span>
                <span className="ml-1 font-medium">{formatBenchmarkValue(benchmark.excellent, benchmark.unit)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Good:</span>
                <span className="ml-1 font-medium">{formatBenchmarkValue(benchmark.good, benchmark.unit)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Average:</span>
                <span className="ml-1 font-medium">{formatBenchmarkValue(benchmark.average, benchmark.unit)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Poor:</span>
                <span className="ml-1 font-medium">{formatBenchmarkValue(benchmark.poor, benchmark.unit)}</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-2 pt-2 border-t">
          <div className="text-xs">
            <span className="text-muted-foreground">Calculation:</span>
            <span className="ml-1 font-mono text-xs">{benchmark.calculation}</span>
          </div>
          <div className="text-xs">
            <span className="text-muted-foreground">Data Source:</span>
            <span className="ml-1">{benchmark.dataSource}</span>
          </div>
        </div>
      </div>
    );
  }, [benchmark, benchmarkStatus, label, tooltip]);

  const content = (
    <div
      className={cn(
        "group relative h-full w-full rounded-lg border p-3 flex flex-col items-center justify-center gap-1 text-center",
        "bg-card text-card-foreground",
        statusRing,
        // uniform card height across grids
        "min-h-[80px]",
        hoverable && "transition-all duration-200 ease-in-out hover:shadow-md hover:scale-[1.01] hover:border-[hsl(var(--border))]/60 cursor-pointer",
        className,
      )}
      aria-label={ariaLabel || label}
      role="group"
      tabIndex={0}
    >
      {/* Benchmark indicator badge */}
      {showBenchmarks && benchmarkStatus && benchmarkStatus !== 'unknown' && (
        <div className="absolute top-2 right-2">
          <Badge 
            variant="outline" 
            className={cn("text-xs px-2 py-0.5", getBenchmarkColor(benchmarkStatus))}
          >
            {benchmarkStatus.charAt(0).toUpperCase() + benchmarkStatus.slice(1)}
          </Badge>
        </div>
      )}
      
      {/* Metric label */}
      <div className="text-xs text-muted-foreground tracking-wide uppercase flex items-center gap-1 max-w-full">
        <span className="truncate">{label}</span>
        {benchmark && (
          <Info className="w-3 h-3 text-muted-foreground/60 flex-shrink-0" />
        )}
      </div>
      
      {/* Metric value */}
      <div className="mt-1 text-xl font-semibold leading-tight max-w-full">
        {loading ? (
          <div className="h-6 w-14 bg-muted rounded animate-pulse" />
        ) : (
          <span className="break-words">{value}</span>
        )}
      </div>
      
      {/* Benchmark comparison indicator */}
      {showBenchmarks && benchmarkStatus && benchmarkStatus !== 'unknown' && numericValue && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          {benchmarkStatus === 'excellent' || benchmarkStatus === 'good' ? (
            <TrendingUp className="w-3 h-3 text-green-500 flex-shrink-0" />
          ) : benchmarkStatus === 'poor' ? (
            <TrendingDown className="w-3 h-3 text-red-500 flex-shrink-0" />
          ) : (
            <Minus className="w-3 h-3 text-yellow-500 flex-shrink-0" />
          )}
          <span className="truncate">
            {benchmarkStatus.charAt(0).toUpperCase() + benchmarkStatus.slice(1)}
          </span>
        </div>
      )}
    </div>
  );

  // Always show tooltip if we have benchmark data, otherwise use the original tooltip logic
  if (benchmark || tooltip) {
    return (
      <Tooltip content={enhancedTooltip} side="top">
        {content}
      </Tooltip>
    );
  }

  return content;
}

// Helper function to format benchmark values
function formatBenchmarkValue(value: number, unit: string): string {
  if (unit === 'percentage') {
    return `${(value * 100).toFixed(1)}%`;
  } else if (unit === 'ratio') {
    return `${value.toFixed(1)}x`;
  } else if (unit === 'days') {
    return `${value.toFixed(0)} days`;
  } else if (unit === 'turns per year') {
    return `${value.toFixed(1)}x`;
  } else if (unit === 'annual percentage') {
    return `${(value * 100).toFixed(1)}%`;
  }
  return value.toString();
}


