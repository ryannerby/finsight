import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SummaryReport } from '../../../../shared/src/types/SummaryReport';
import { HealthScoreRing } from '@/components/ui/health-score-ring';
import { ResultsHeaderSkeleton } from '@/components/skeletons';

interface ResultsHeaderProps {
  summaryReport: SummaryReport | null;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}



// Recommendation pill with icon
const RecommendationPill = ({ recommendation }: { recommendation: SummaryReport['recommendation'] }) => {
  const getRecommendationConfig = (decision: string) => {
    switch (decision) {
      case 'Proceed':
        return {
          icon: CheckCircle,
          variant: 'success' as const,
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'Caution':
        return {
          icon: AlertTriangle,
          variant: 'warning' as const,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'Pass':
        return {
          icon: XCircle,
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      default:
        return {
          icon: AlertCircle,
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const config = getRecommendationConfig(recommendation.decision);
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center space-y-2">
      <Badge 
        variant={config.variant}
        className={cn("px-4 py-2 text-sm font-semibold border", config.className)}
      >
        <Icon className="w-4 h-4 mr-2" />
        {recommendation.decision}
      </Badge>
      <div className="text-xs text-muted-foreground text-center">
        Confidence: {Math.round(recommendation.confidence * 100)}%
      </div>
    </div>
  );
};

// Top highlights cards
const TopHighlights = ({ summaryReport }: { summaryReport: SummaryReport }) => {
  const highlights = [
    {
      type: 'strength',
      title: summaryReport.top_strengths[0]?.title || 'Top Strength',
      description: summaryReport.top_strengths[0]?.description || 'No strengths identified',
      impact: summaryReport.top_strengths[0]?.impact || 'medium',
      icon: TrendingUp,
      className: 'border-green-200 bg-green-50'
    },
    {
      type: 'risk',
      title: summaryReport.top_risks[0]?.title || 'Top Risk',
      description: summaryReport.top_risks[0]?.description || 'No risks identified',
      impact: summaryReport.top_risks[0]?.impact || 'medium',
      icon: AlertCircle,
      className: 'border-red-200 bg-red-50'
    },
    {
      type: 'metric',
      title: 'Key Metric',
      description: 'Financial health indicator',
      impact: 'high',
      icon: BarChart3,
      className: 'border-blue-200 bg-blue-50'
    }
  ];

  return (
    <div className="flex flex-col space-y-3">
      {highlights.map((highlight, index) => {
        const Icon = highlight.icon;
        return (
          <Card key={index} className={cn("border-2", highlight.className)}>
            <CardContent className="p-3">
              <div className="flex items-start space-x-2">
                <Icon className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-medium text-foreground truncate">
                    {highlight.title}
                  </h4>
                  <p className="text-xs text-muted-foreground overflow-hidden text-ellipsis" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {highlight.description}
                  </p>
                  <Badge 
                    variant="outline" 
                    className="mt-1 text-xs px-2 py-0.5"
                  >
                    {highlight.impact} impact
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Loading skeleton for the entire header - now imported from skeletons

export function ResultsHeader({ 
  summaryReport, 
  isLoading = false, 
  error = null,
  className 
}: ResultsHeaderProps) {
  // Show skeleton while loading
  if (isLoading) {
    return <ResultsHeaderSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <Card className={cn("border-destructive/50", className)}>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">Failed to load analysis results</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show placeholder when no data
  if (!summaryReport) {
    return (
      <Card className={cn("border-dashed", className)}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">No analysis results available</p>
            <p className="text-sm">Upload financial documents to generate a report</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6 bg-card rounded-lg border", className)}>
      {/* Left - Recommendation */}
      <div className="flex flex-col items-center justify-center">
        <RecommendationPill recommendation={summaryReport.recommendation} />
      </div>

      {/* Center - Health Score */}
      <div className="flex flex-col items-center justify-center space-y-2">
        <HealthScoreRing 
          score={summaryReport.health_score.overall}
          size={80}
          stroke={8}
          tooltip="Overall financial health score"
        />
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">
            {summaryReport.health_score.overall}/100
          </div>
          <div className="text-xs text-muted-foreground">
            Financial Health Score
          </div>
        </div>
      </div>

      {/* Right - Top Highlights */}
      <div className="flex flex-col justify-center">
        <TopHighlights summaryReport={summaryReport} />
      </div>
    </div>
  );
}
