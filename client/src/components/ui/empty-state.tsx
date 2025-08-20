import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Button } from "./button"
import { Badge } from "./badge"
import { 
  FileText, 
  Upload, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calculator,
  Lightbulb,
  Download,
  Play,
  BookOpen,
  ArrowRight
} from "lucide-react"

interface EmptyStateProps {
  title: string
  helper?: string
  action?: React.ReactNode
  variant?: "default" | "deals" | "saved-deals" | "analysis" | "files" | "metrics"
  showSampleData?: boolean
  showQuickStart?: boolean
  showFileExamples?: boolean
  showTips?: boolean
}

export function EmptyState({ 
  title, 
  helper, 
  action, 
  variant = "default",
  showSampleData = false,
  showQuickStart = false,
  showFileExamples = false,
  showTips = false
}: EmptyStateProps) {
  const getIcon = () => {
    switch (variant) {
      case "deals":
        return <BarChart3 className="mx-auto h-12 w-12" />
      case "saved-deals":
        return <BookOpen className="mx-auto h-12 w-12" />
      case "analysis":
        return <Calculator className="mx-auto h-12 w-12" />
      case "files":
        return <FileText className="mx-auto h-12 w-12" />
      case "metrics":
        return <TrendingUp className="mx-auto h-12 w-12" />
      default:
        return (
          <svg className="mx-auto h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
        )
    }
  }

  const getSampleDealCard = () => (
    <Card className="border-dashed border-2 bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
      <CardHeader className="p-4 pb-3">
        <div className="flex justify-between items-start">
          <div className="min-w-0">
            <div className="text-title text-muted-foreground">Sample SaaS Company</div>
            <div className="text-sm text-muted-foreground/70 truncate">High-growth SaaS with strong unit economics</div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-2 py-0.5 text-xs">3 docs</Badge>
            <div className="text-xs text-muted-foreground/60">2 days ago</div>
          </div>
        </div>
      </CardHeader>
    </Card>
  )

  const getSampleMetrics = () => (
    <div className="grid grid-cols-2 gap-3">
      <div className="text-center p-3 bg-muted/20 rounded-lg border border-dashed">
        <div className="text-2xl font-bold text-primary">42%</div>
        <div className="text-xs text-muted-foreground">Gross Margin</div>
      </div>
      <div className="text-center p-3 bg-muted/20 rounded-lg border border-dashed">
        <div className="text-2xl font-bold text-primary">1.8x</div>
        <div className="text-xs text-muted-foreground">Current Ratio</div>
      </div>
    </div>
  )

  const getFileExamples = () => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 p-2 bg-muted/20 rounded border border-dashed">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">sample_pnl.csv</span>
        <Badge variant="outline" className="text-xs">CSV</Badge>
      </div>
      <div className="flex items-center gap-2 p-2 bg-muted/20 rounded border border-dashed">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">sample_bs.xlsx</span>
        <Badge variant="outline" className="text-xs">Excel</Badge>
      </div>
      <div className="flex items-center gap-2 p-2 bg-muted/20 rounded border border-dashed">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">sample_cf.csv</span>
        <Badge variant="outline" className="text-xs">CSV</Badge>
      </div>
    </div>
  )

  const getQuickStartTemplates = () => (
    <div className="grid gap-3">
      <Button variant="outline" className="justify-start h-auto p-4">
        <div className="flex items-start gap-3 text-left">
          <div className="p-2 bg-primary/10 rounded-lg">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">Growth Company Analysis</div>
            <div className="text-xs text-muted-foreground">Perfect for SaaS and tech companies</div>
          </div>
        </div>
      </Button>
      <Button variant="outline" className="justify-start h-auto p-4">
        <div className="flex items-start gap-3 text-left">
          <div className="p-2 bg-primary/10 rounded-lg">
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">Manufacturing Deep Dive</div>
            <div className="text-xs text-muted-foreground">Ideal for industrial businesses</div>
          </div>
        </div>
      </Button>
    </div>
  )

  const getTips = () => (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <span className="font-medium">Upload multiple files</span> - Combine P&L, balance sheet, and cash flow for comprehensive analysis
        </div>
      </div>
      <div className="flex items-start gap-2">
        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <span className="font-medium">Use consistent formats</span> - Ensure your CSV/Excel files have clear headers and consistent data structure
        </div>
      </div>
      <div className="flex items-start gap-2">
        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <span className="font-medium">Include multiple periods</span> - Historical data helps identify trends and patterns
        </div>
      </div>
    </div>
  )

  return (
    <div className="text-center py-8 max-w-2xl mx-auto">
      <div className="text-foreground/30 mb-4">
        {getIcon()}
      </div>
      
      <div className="font-medium text-lg mb-2">{title}</div>
      {helper && <div className="text-sm text-muted-foreground mb-6">{helper}</div>}
      
      {action && <div className="mb-8">{action}</div>}

      {/* Sample Data Preview */}
      {showSampleData && variant === "deals" && (
        <div className="mb-8">
          <div className="text-sm font-medium text-muted-foreground mb-3">Sample Deal Preview</div>
          {getSampleDealCard()}
        </div>
      )}

      {showSampleData && variant === "metrics" && (
        <div className="mb-8">
          <div className="text-sm font-medium text-muted-foreground mb-3">Sample Metrics</div>
          {getSampleMetrics()}
        </div>
      )}

      {/* Quick Start Templates */}
      {showQuickStart && (
        <div className="mb-8 text-left">
          <div className="text-sm font-medium text-muted-foreground mb-3 text-center">Quick Start Templates</div>
          {getQuickStartTemplates()}
        </div>
      )}

      {/* File Format Examples */}
      {showFileExamples && (
        <div className="mb-8 text-left">
          <div className="text-sm font-medium text-muted-foreground mb-3 text-center">Supported File Formats</div>
          {getFileExamples()}
        </div>
      )}

      {/* Helpful Tips */}
      {showTips && (
        <div className="mb-6 text-left">
          <div className="text-sm font-medium text-muted-foreground mb-3 text-center">💡 Pro Tips for First-Time Users</div>
          {getTips()}
        </div>
      )}

      {/* Additional Action Buttons */}
      {variant === "deals" && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download Sample Data
          </Button>
          <Button variant="outline" className="gap-2">
            <Play className="h-4 w-4" />
            View Tutorial
          </Button>
        </div>
      )}
    </div>
  )
}



