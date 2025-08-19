import React from 'react';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { HealthScoreRing } from './health-score-ring';
import { Tooltip } from './tooltip';
import { Download, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, BarChart3, FileText } from 'lucide-react';

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
            {topStrengths.map((strength, index) => (
              <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="font-medium text-green-800 text-sm">{strength.title}</div>
                <div className="text-xs text-green-600 mt-1">{strength.evidence}</div>
                {strength.page && (
                  <div className="text-xs text-green-500 mt-1">Page {strength.page}</div>
                )}
              </div>
            ))}
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
            {topRisks.map((risk, index) => (
              <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="font-medium text-red-800 text-sm">{risk.title}</div>
                <div className="text-xs text-red-600 mt-1">{risk.evidence}</div>
                {risk.page && (
                  <div className="text-xs text-red-500 mt-1">Page {risk.page}</div>
                )}
              </div>
            ))}
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
