import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { EvidenceDrawer } from './EvidenceDrawer';
import { StatusChip } from '@/components/ui/status-chip';
import { cn } from '@/lib/utils';
import { SummaryReport } from '../../../../shared/src/types';
import { 
  UISummaryReport,
  mapSummaryReportToUI,
  getSafeHealthScore,
  getSafeTrafficLights,
  hasValidData
} from '@/lib/dataMappers';
import { 
  TrendingUp, 
  DollarSign, 
  Shield, 
  BarChart3, 
  Info,
  ChevronRight
} from 'lucide-react';

interface HealthPanelProps {
  summaryReport: SummaryReport | null | undefined;
  className?: string;
}

interface MetricItem {
  key: string;
  label: string;
  value: number;
  status: 'good' | 'warning' | 'risk' | 'neutral';
  evidence?: any[];
  description?: string;
  trend?: 'improving' | 'stable' | 'declining' | 'volatile';
}

/**
 * Health Panel Component
 * Consolidated view of financial health metrics organized by category
 */
export function HealthPanel({ summaryReport, className }: HealthPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [evidenceDrawerOpen, setEvidenceDrawerOpen] = useState(false);
  const [currentEvidenceItems, setCurrentEvidenceItems] = useState<any[]>([]);
  const [currentEvidenceTitle, setCurrentEvidenceTitle] = useState('');

  // Transform server data to UI models
  const uiSummaryReport = mapSummaryReportToUI(summaryReport);
  
  // Gate rendering by data presence
  if (!hasValidData(uiSummaryReport)) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Financial Health Panel</CardTitle>
          <p className="text-sm text-muted-foreground">
            No financial health data available. Upload documents and run analysis to see health metrics.
          </p>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">
            <p>Complete financial analysis required to display health metrics.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Tab configuration
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      description: 'Key health indicators and overall score'
    },
    {
      id: 'profitability-growth',
      label: 'Profitability & Growth',
      icon: TrendingUp,
      description: 'Revenue, margins, and growth metrics'
    },
    {
      id: 'liquidity-leverage',
      label: 'Liquidity & Leverage',
      icon: Shield,
      description: 'Liquidity ratios and debt metrics'
    },
    {
      id: 'efficiency-quality',
      label: 'Efficiency & Data Quality',
      icon: DollarSign,
      description: 'Operational efficiency and data completeness'
    }
  ];

  // Helper function to get status from score
  const getStatusFromScore = (score: number): 'good' | 'warning' | 'risk' | 'neutral' => {
    if (score >= 80) return 'good';
    if (score >= 50) return 'warning';
    return 'risk';
  };

  // Helper function to get status variant for StatusChip
  const getStatusVariant = (status: 'good' | 'warning' | 'risk' | 'neutral') => {
    switch (status) {
      case 'good': return 'good';
      case 'warning': return 'caution';
      case 'risk': return 'risk';
      default: return 'info';
    }
  };

  // Helper function to transform evidence for EvidenceDrawer
  const transformEvidenceForDrawer = (evidence: any[], metricLabel: string) => {
    return evidence.map((item, idx) => ({
      id: item.ref || `evidence-${idx}`,
      excerpt: item.context || item.quote || `Evidence from ${item.type}`,
      metricId: item.ref,
      sourceDocName: item.document_id || 'Unknown Document',
      page: item.page,
      row: undefined, // Not available in current Evidence type
      link: undefined, // Could be enhanced with document viewer route
      confidence: item.confidence,
      type: item.type,
      documentId: item.document_id,
      extractedAt: undefined, // Not available in current Evidence type
      extractedBy: undefined // Not available in current Evidence type
    }));
  };

  // Handler for opening evidence drawer
  const handleOpenEvidence = (evidence: any[], metricLabel: string) => {
    setCurrentEvidenceItems(transformEvidenceForDrawer(evidence, metricLabel));
    setCurrentEvidenceTitle(`Evidence for ${metricLabel}`);
    setEvidenceDrawerOpen(true);
  };

  // Overview metrics - health score components and key traffic lights
  const overviewMetrics: MetricItem[] = [
    {
      key: 'overall_health',
      label: 'Overall Health Score',
      value: uiSummaryReport?.health_score?.overall || 0,
      status: getStatusFromScore(uiSummaryReport?.health_score?.overall || 0),
      description: 'Weighted average of all health indicators'
    },
    {
      key: 'profitability',
      label: 'Profitability',
      value: uiSummaryReport?.health_score?.components?.profitability || 0,
      status: getStatusFromScore(uiSummaryReport?.health_score?.components?.profitability || 0),
      description: 'Margin performance and profitability trends'
    },
    {
      key: 'growth',
      label: 'Growth',
      value: uiSummaryReport?.health_score?.components?.growth || 0,
      status: getStatusFromScore(uiSummaryReport?.health_score?.components?.growth || 0),
      description: 'Revenue and earnings growth patterns'
    },
    {
      key: 'liquidity',
      label: 'Liquidity',
      value: uiSummaryReport?.health_score?.components?.liquidity || 0,
      status: getStatusFromScore(uiSummaryReport?.health_score?.components?.liquidity || 0),
      description: 'Short-term financial flexibility'
    }
  ];

  // Profitability & Growth metrics
  const profitabilityGrowthMetrics: MetricItem[] = [
    {
      key: 'revenue_quality',
      label: 'Revenue Quality',
      value: uiSummaryReport?.traffic_lights?.revenue_quality?.score || 0,
      status: getStatusFromScore(uiSummaryReport?.traffic_lights?.revenue_quality?.score || 0),
      evidence: uiSummaryReport?.traffic_lights?.revenue_quality?.evidence,
      description: uiSummaryReport?.traffic_lights?.revenue_quality?.reasoning
    },
    {
      key: 'margin_trends',
      label: 'Margin Trends',
      value: uiSummaryReport?.traffic_lights?.margin_trends?.score || 0,
      status: getStatusFromScore(uiSummaryReport?.traffic_lights?.margin_trends?.score || 0),
      evidence: uiSummaryReport?.traffic_lights?.margin_trends?.evidence,
      description: uiSummaryReport?.traffic_lights?.margin_trends?.reasoning
    },
    {
      key: 'leverage',
      label: 'Leverage',
      value: uiSummaryReport?.health_score?.components?.leverage || 0,
      status: getStatusFromScore(uiSummaryReport?.health_score?.components?.leverage || 0),
      description: 'Debt levels and financial leverage'
    }
  ];

  // Liquidity & Leverage metrics
  const liquidityLeverageMetrics: MetricItem[] = [
    {
      key: 'liquidity_ratio',
      label: 'Liquidity Ratio',
      value: uiSummaryReport?.traffic_lights?.liquidity?.score || 0,
      status: getStatusFromScore(uiSummaryReport?.traffic_lights?.liquidity?.score || 0),
      evidence: uiSummaryReport?.traffic_lights?.liquidity?.evidence,
      description: uiSummaryReport?.traffic_lights?.liquidity?.reasoning
    },
    {
      key: 'working_capital',
      label: 'Working Capital',
      value: uiSummaryReport?.traffic_lights?.working_capital?.score || 0,
      status: getStatusFromScore(uiSummaryReport?.traffic_lights?.working_capital?.score || 0),
      evidence: uiSummaryReport?.traffic_lights?.working_capital?.evidence,
      description: uiSummaryReport?.traffic_lights?.working_capital?.reasoning
    }
  ];

  // Efficiency & Data Quality metrics
  const efficiencyQualityMetrics: MetricItem[] = [
    {
      key: 'efficiency',
      label: 'Operational Efficiency',
      value: uiSummaryReport?.health_score?.components?.efficiency || 0,
      status: getStatusFromScore(uiSummaryReport?.health_score?.components?.efficiency || 0),
      description: 'Asset utilization and operational performance'
    },
    {
      key: 'data_quality',
      label: 'Data Quality',
      value: uiSummaryReport?.traffic_lights?.data_quality?.score || 0,
      status: getStatusFromScore(uiSummaryReport?.traffic_lights?.data_quality?.score || 0),
      evidence: uiSummaryReport?.traffic_lights?.data_quality?.evidence,
      description: uiSummaryReport?.traffic_lights?.data_quality?.reasoning
    }
  ];

  // Get metrics for current tab
  const getCurrentTabMetrics = () => {
    switch (activeTab) {
      case 'overview':
        return overviewMetrics;
      case 'profitability-growth':
        return profitabilityGrowthMetrics;
      case 'liquidity-leverage':
        return liquidityLeverageMetrics;
      case 'efficiency-quality':
        return efficiencyQualityMetrics;
      default:
        return overviewMetrics;
    }
  };

  const currentMetrics = getCurrentTabMetrics();

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Financial Health Panel</CardTitle>
        <p className="text-sm text-muted-foreground">
          Comprehensive view of financial health indicators and supporting evidence
        </p>
      </CardHeader>
      
      {/* Tab Navigation */}
      <div className="px-6 pb-4">
        <div className="flex flex-wrap gap-1 bg-muted p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap min-w-0",
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Tab Description */}
        <div className="mt-3 text-sm text-muted-foreground text-center">
          {tabs.find(tab => tab.id === activeTab)?.description}
        </div>
      </div>

      <Separator />

      {/* Tab Content */}
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {currentMetrics.map((metric) => {
            // Skip metrics with null values
            if (metric.value === null) {
              return (
                <div
                  key={metric.key}
                  className="p-6 rounded-lg border-2 border-dashed border-muted bg-muted/20 h-full flex items-center justify-center"
                >
                  <div className="text-center space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      {metric.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Add data to unlock
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={metric.key}
                className="p-6 rounded-lg border-2 transition-all duration-200 hover:shadow-md bg-card h-full flex flex-col"
              >
                {/* Metric Header */}
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-sm text-foreground">
                    {metric.label}
                  </h4>
                  <StatusChip 
                    variant={getStatusVariant(metric.status)}
                    size="sm"
                  >
                    {metric.status === 'good' ? 'Good' : 
                     metric.status === 'warning' ? 'Caution' : 
                     metric.status === 'risk' ? 'Risk' : 'Info'}
                  </StatusChip>
                </div>

                {/* Metric Value */}
                <div className="text-3xl font-bold text-foreground mb-3">
                  {metric.value}
                  <span className="text-sm text-muted-foreground ml-1">/ 100</span>
                </div>

                {/* Description */}
                {metric.description && (
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed flex-1">
                    {metric.description}
                  </p>
                )}

                {/* Evidence Button */}
                {metric.evidence && metric.evidence.length > 0 && (
                  <div className="flex items-center justify-between mt-auto pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 px-3"
                      onClick={() => handleOpenEvidence(metric.evidence!, metric.label)}
                    >
                      <Info className="w-3 h-3 mr-1" />
                      Evidence
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                    
                    <Badge variant="outline" className="text-xs">
                      {metric.evidence.length} item{metric.evidence.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <StatusChip variant="good" size="sm">Good</StatusChip>
              <span>80-100: Excellent performance</span>
            </div>
            <div className="flex items-center space-x-2">
              <StatusChip variant="caution" size="sm">Caution</StatusChip>
              <span>50-79: Requires attention</span>
            </div>
            <div className="flex items-center space-x-2">
              <StatusChip variant="risk" size="sm">Risk</StatusChip>
              <span>0-49: Immediate action needed</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* Evidence Drawer */}
      <EvidenceDrawer
        open={evidenceDrawerOpen}
        onOpenChange={setEvidenceDrawerOpen}
        items={currentEvidenceItems}
        title={currentEvidenceTitle}
      />
    </Card>
  );
}

/**
 * Compact Health Panel Component
 * Smaller version for use in summary views
 */
export function HealthPanelCompact({ summaryReport, className }: { summaryReport: SummaryReport; className?: string }) {
  const greenCount = Object.values(summaryReport.traffic_lights).filter(tl => tl.status === 'green').length;
  const yellowCount = Object.values(summaryReport.traffic_lights).filter(tl => tl.status === 'yellow').length;
  const redCount = Object.values(summaryReport.traffic_lights).filter(tl => tl.status === 'red').length;
  const totalCount = Object.keys(summaryReport.traffic_lights).length;

  return (
    <div className={cn("flex items-center space-x-4", className)}>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">Health:</span>
        <div className="flex space-x-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs text-green-600">{greenCount}</span>
        </div>
        <div className="flex space-x-1">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="text-xs text-yellow-600">{yellowCount}</span>
        </div>
        <div className="flex space-x-1">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-xs text-red-600">{redCount}</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground">
        {greenCount}/{totalCount} indicators healthy
      </span>
    </div>
  );
}
