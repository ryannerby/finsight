import React from 'react';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { HealthScoreRing } from './health-score-ring';
import { Tooltip } from './tooltip';
import { Download, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, BarChart3, FileText } from 'lucide-react';

// Helper function to format metric names beautifully
const formatMetricName = (metricKey: string): string => {
  const metricNames: Record<string, string> = {
    'revenue_cagr_3y': 'Revenue Growth (3Y)',
    'revenue_cagr': 'Revenue Growth',
    'inventory_turns': 'Inventory Turnover',
    'ebitda_margin': 'EBITDA Margin',
    'debt_to_equity': 'Debt-to-Equity Ratio',
    'current_ratio': 'Current Ratio',
    'ebitda_to_interest': 'Interest Coverage',
    'quick_ratio': 'Quick Ratio',
    'gross_margin': 'Gross Margin',
    'net_margin': 'Net Margin',
    'ar_days': 'Accounts Receivable Days',
    'ap_days': 'Accounts Payable Days',
    'ccc_days': 'Cash Conversion Cycle',
    'working_capital_ccc': 'Working Capital Cycle',
    'dscr_proxy': 'Debt Service Coverage',
    'seasonality': 'Seasonality Index',
    'accrual_vs_cash_delta': 'Accrual vs Cash Delta',
    'dio_days': 'Days Inventory Outstanding',
    'dso_days': 'Days Sales Outstanding',
    'dpo_days': 'Days Payable Outstanding',
    'working_capital': 'Working Capital',
    'total_debt': 'Total Debt',
    'cash_flow': 'Cash Flow',
    'operating_margin': 'Operating Margin',
    'return_on_equity': 'Return on Equity',
    'return_on_assets': 'Return on Assets',
    'asset_turnover': 'Asset Turnover',
    'leverage_ratio': 'Leverage Ratio',
    'interest_coverage': 'Interest Coverage Ratio'
  };
  
  return metricNames[metricKey] || metricKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Helper function to format metric values beautifully
const formatMetricValue = (metricKey: string, value: any): string => {
  if (value == null || Number.isNaN(value)) return 'N/A';
  
  const numValue = Number(value);
  if (isNaN(numValue)) return String(value);
  
  // Format based on metric type
  if (metricKey.includes('margin') || metricKey.includes('cagr') || metricKey.includes('seasonality') || metricKey.includes('delta')) {
    return `${(numValue * 100).toFixed(1)}%`;
  }
  if (metricKey.includes('ratio') || metricKey.includes('turns') || metricKey.includes('coverage')) {
    return `${numValue.toFixed(2)}x`;
  }
  if (metricKey.includes('days') || metricKey.includes('ccc')) {
    return `${Math.round(numValue)} days`;
  }
  
  return numValue.toFixed(3);
};

// Helper function to extract and format metrics from evidence text
const formatEvidence = (evidence: string): { title: string; metrics: Array<{ name: string; value: string; key: string }> } => {
  if (!evidence || typeof evidence !== 'string') {
    return { title: 'Financial metric analysis', metrics: [] };
  }
  
  // Extract metric patterns like "revenue_cagr_3y=0.9789" and "quick_ratio=null"
  // Use a more specific pattern to avoid splitting metric names incorrectly
  const metricPattern = /([a-z_]+(?:_[a-z0-9]+)*)=([\d.-]+|null|undefined)/g;
  const metrics: Array<{ name: string; value: string; key: string }> = [];
  let match;
  
  while ((match = metricPattern.exec(evidence)) !== null) {
    const [, key, value] = match;
    // Skip null/undefined values
    if (value === 'null' || value === 'undefined') {
      continue;
    }
    
    metrics.push({
      key,
      name: formatMetricName(key),
      value: formatMetricValue(key, value)
    });
  }
  
  // Clean up the evidence text by removing raw metric data
  let cleanEvidence = evidence.replace(metricPattern, '').replace(/,\s*$/, '').trim();
  
  // Also clean up any standalone metric names without values
  cleanEvidence = cleanEvidence.replace(/\b[a-z_]+\b/g, (match) => {
    if (match.includes('_')) {
      return formatMetricName(match);
    }
    return match;
  }).trim();
  
  return { title: cleanEvidence || 'Financial metric analysis', metrics };
};

interface HealthScoreDashboardProps {
  healthScore: number;
  trafficLights: Record<string, 'green' | 'yellow' | 'red'>;
  recommendation: 'Proceed' | 'Caution' | 'Pass';
  topStrengths: Array<{ title: string; evidence: string; page?: number }>;
  topRisks: Array<{ title: string; evidence: string; page?: number }>;
  dataCompleteness: number;
  confidenceScore: number;
  onReviewConcerns?: () => void;
  onDownloadReport?: () => void;
  onViewDetails?: () => void;
  className?: string;
}

export function HealthScoreDashboard({
  healthScore,
  trafficLights,
  recommendation,
  topStrengths,
  topRisks,
  dataCompleteness,
  confidenceScore,
  onReviewConcerns,
  onDownloadReport,
  onViewDetails,
  className = ''
}: HealthScoreDashboardProps) {
  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'Proceed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Caution': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Pass': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'Proceed': return <CheckCircle className="w-4 h-4" />;
      case 'Caution': return <AlertTriangle className="w-4 h-4" />;
      case 'Pass': return <TrendingDown className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDataCompletenessColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const greenLights = Object.values(trafficLights).filter(v => v === 'green').length;
  const yellowLights = Object.values(trafficLights).filter(v => v === 'yellow').length;
  const redLights = Object.values(trafficLights).filter(v => v === 'red').length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Health Score Section */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <BarChart3 className="w-6 h-6 text-primary" />
            Deal Health Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Health Score and Recommendation Row */}
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
            {/* Health Score Ring */}
            <div className="flex flex-col items-center gap-3">
              <HealthScoreRing
                score={healthScore}
                size={120}
                stroke={12}
                tooltip="Overall deal health based on comprehensive financial analysis"
              />
              <div className="text-center">
                <div className="text-sm font-medium text-muted-foreground">Health Score</div>
                <div className="text-xs text-muted-foreground">
                  {healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : healthScore >= 40 ? 'Fair' : 'Poor'}
                </div>
              </div>
            </div>

            {/* Recommendation and Quick Actions */}
            <div className="flex-1 space-y-4">
              {/* Recommendation Badge */}
              <div className="flex items-center gap-3">
                <Badge 
                  variant="outline" 
                  className={`text-lg px-4 py-2 border-2 ${getRecommendationColor(recommendation)}`}
                >
                  <div className="flex items-center gap-2">
                    {getRecommendationIcon(recommendation)}
                    <span className="font-semibold">{recommendation}</span>
                  </div>
                </Badge>
                <div className="text-sm text-muted-foreground">
                  {recommendation === 'Proceed' && 'Deal appears viable with manageable risks'}
                  {recommendation === 'Caution' && 'Proceed with additional due diligence'}
                  {recommendation === 'Pass' && 'Significant concerns outweigh benefits'}
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {onReviewConcerns && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onReviewConcerns}
                    className="flex items-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Review Concerns
                  </Button>
                )}
                {onDownloadReport && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onDownloadReport}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Report
                  </Button>
                )}
                {onViewDetails && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onViewDetails}
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    View Details
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Traffic Lights Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground">Traffic Light Summary</h4>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">{greenLights} Green</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm">{yellowLights} Yellow</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm">{redLights} Red</span>
                </div>
              </div>
            </div>

            {/* Confidence & Data Quality */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground">Analysis Quality</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Confidence Score</span>
                  <span className={`text-sm font-medium ${getConfidenceColor(confidenceScore)}`}>
                    {confidenceScore}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Data Completeness</span>
                  <span className={`text-sm font-medium ${getDataCompletenessColor(dataCompleteness)}`}>
                    {dataCompleteness}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strengths and Risks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Strengths */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-green-700">
              <CheckCircle className="w-5 h-5" />
              Top Strengths ({topStrengths.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topStrengths.map((strength, index) => {
              const formattedEvidence = formatEvidence(strength.evidence);
              return (
                <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="font-medium text-green-800 text-sm">{strength.title}</div>
                  {formattedEvidence.title && (
                    <div className="text-xs text-green-600 mt-1">{formattedEvidence.title}</div>
                  )}
                  {formattedEvidence.metrics.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {formattedEvidence.metrics.map((metric, metricIdx) => (
                        <div key={metricIdx} className="flex items-center justify-between bg-white/50 rounded px-2 py-1 border border-green-100">
                          <span className="text-xs font-medium text-green-700">{metric.name}</span>
                          <span className="text-xs font-semibold text-green-800 bg-green-100 px-1.5 py-0.5 rounded">
                            {metric.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {strength.page && (
                    <div className="text-xs text-green-500 mt-1">Page {strength.page}</div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Top Risks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Top Risks ({topRisks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topRisks.map((risk, index) => {
              const formattedEvidence = formatEvidence(risk.evidence);
              return (
                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="font-medium text-red-800 text-sm">{risk.title}</div>
                  {formattedEvidence.title && (
                    <div className="text-xs text-red-600 mt-1">{formattedEvidence.title}</div>
                  )}
                  {formattedEvidence.metrics.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {formattedEvidence.metrics.map((metric, metricIdx) => (
                        <div key={metricIdx} className="flex items-center justify-between bg-white/50 rounded px-2 py-1 border border-red-100">
                          <span className="text-xs font-medium text-red-700">{metric.name}</span>
                          <span className="text-xs font-semibold text-red-800 bg-red-100 px-1.5 py-0.5 rounded">
                            {metric.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {risk.page && (
                    <div className="text-xs text-red-500 mt-1">Page {risk.page}</div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Traffic Lights */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Detailed Factor Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(trafficLights).map(([factor, status]) => (
              <Tooltip key={factor} content={`Factor: ${factor.replace(/_/g, ' ')}`}>
                <div className="flex items-center gap-2 p-3 rounded-lg border">
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'green' ? 'bg-green-500' : 
                    status === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium capitalize">
                    {factor.replace(/_/g, ' ')}
                  </span>
                </div>
              </Tooltip>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
