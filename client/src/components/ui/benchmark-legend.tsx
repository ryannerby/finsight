import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "./badge"
import { Info, TrendingUp, TrendingDown, Minus } from "lucide-react"

export interface BenchmarkLegendProps {
  className?: string
  showTitle?: boolean
}

export function BenchmarkLegend({ className, showTitle = true }: BenchmarkLegendProps) {
  return (
    <div className={cn("bg-muted/30 rounded-lg p-4 space-y-3", className)}>
      {showTitle && (
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-muted-foreground" />
          <h4 className="text-sm font-medium">Benchmark Legend</h4>
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200 px-2 py-0.5">
            Excellent
          </Badge>
          <div className="flex items-center gap-1 text-muted-foreground">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span>Top 25%</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200 px-2 py-0.5">
            Good
          </Badge>
          <div className="flex items-center gap-1 text-muted-foreground">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span>Top 50%</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-yellow-600 bg-yellow-50 border-yellow-200 px-2 py-0.5">
            Average
          </Badge>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Minus className="w-3 h-3 text-yellow-500" />
            <span>Industry avg</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200 px-2 py-0.5">
            Poor
          </Badge>
          <div className="flex items-center gap-1 text-muted-foreground">
            <TrendingDown className="w-3 h-3 text-red-500" />
            <span>Below avg</span>
          </div>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground pt-2 border-t">
        <p>
          Benchmarks are based on industry averages from S&P 500, Russell 2000, and sector-specific data. 
          Hover over metrics for detailed explanations and calculation methods.
        </p>
      </div>
    </div>
  )
}
