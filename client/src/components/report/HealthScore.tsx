import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SummaryReport } from '../../../../shared/src/types';

interface HealthScoreProps {
  healthScore: SummaryReport['health_score'];
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showComponents?: boolean;
  className?: string;
}

/**
 * Health Score Gauge Component
 * Displays a financial health score as a circular gauge with color coding
 */
export function HealthScore({ 
  healthScore, 
  size = 'md', 
  showLabel = true, 
  showComponents = true,
  className 
}: HealthScoreProps) {
  const { overall, components, methodology } = healthScore;
  
  // Validate score range
  const clampedScore = Math.max(0, Math.min(100, overall));
  
  // Size configurations
  const sizeConfig = {
    sm: { width: 120, height: 120, strokeWidth: 8, fontSize: 'text-lg' },
    md: { width: 160, height: 160, strokeWidth: 12, fontSize: 'text-2xl' },
    lg: { width: 200, height: 200, strokeWidth: 16, fontSize: 'text-3xl' }
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (clampedScore / 100) * circumference;
  const remaining = circumference - progress;

  // Color coding based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (score >= 60) return { label: 'Good', color: 'bg-yellow-100 text-yellow-800' };
    if (score >= 40) return { label: 'Fair', color: 'bg-orange-100 text-orange-800' };
    return { label: 'Poor', color: 'bg-red-100 text-red-800' };
  };

  const scoreColor = getScoreColor(clampedScore);
  const scoreStatus = getScoreStatus(clampedScore);

  // Component score items
  const componentItems = [
    { key: 'profitability', label: 'Profitability', score: components.profitability, weight: 25 },
    { key: 'growth', label: 'Growth', score: components.growth, weight: 20 },
    { key: 'liquidity', label: 'Liquidity', score: components.liquidity, weight: 20 },
    { key: 'leverage', label: 'Leverage', score: components.leverage, weight: 15 },
    { key: 'efficiency', label: 'Efficiency', score: components.efficiency, weight: 15 },
    { key: 'data_quality', label: 'Data Quality', score: components.data_quality, weight: 5 }
  ];

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Financial Health Score</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {/* Gauge Visualization */}
        <div className="relative inline-block">
          <svg
            width={config.width}
            height={config.height}
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              cx={config.width / 2}
              cy={config.height / 2}
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={config.strokeWidth}
            />
            
            {/* Progress circle */}
            <circle
              cx={config.width / 2}
              cy={config.height / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={config.strokeWidth}
              strokeLinecap="round"
              className={cn("transition-all duration-1000 ease-out", scoreColor)}
              strokeDasharray={circumference}
              strokeDashoffset={remaining}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: remaining,
              }}
            />
          </svg>
          
          {/* Score display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={cn("font-bold font-mono", config.fontSize, scoreColor)}>
              {clampedScore}
            </div>
            <div className="text-xs text-muted-foreground">/ 100</div>
          </div>
        </div>

        {/* Status and Label */}
        {showLabel && (
          <div className="text-center space-y-2">
            <Badge className={cn("px-3 py-1", scoreStatus.color)}>
              {scoreStatus.label}
            </Badge>
            <div className="text-sm text-muted-foreground">
              {clampedScore >= 80 && "Strong financial position with minimal risks"}
              {clampedScore >= 60 && clampedScore < 80 && "Good financial health with some areas for improvement"}
              {clampedScore >= 40 && clampedScore < 60 && "Moderate financial health requiring attention"}
              {clampedScore < 40 && "Financial health needs immediate attention and intervention"}
            </div>
          </div>
        )}

        {/* Component Scores */}
        {showComponents && (
          <div className="w-full space-y-3">
            <div className="text-center">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Component Breakdown</h4>
              <p className="text-xs text-muted-foreground mb-3">{methodology}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {componentItems.map((item) => (
                <div key={item.key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600">{item.label}</span>
                    <Badge variant="outline" className="text-xs">
                      {item.weight}%
                    </Badge>
                  </div>
                  <div className={cn("text-sm font-medium", getScoreColor(item.score))}>
                    {item.score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Compact Health Score Component
 * Smaller version for use in lists or cards
 */
export function HealthScoreCompact({ healthScore, className }: { healthScore: SummaryReport['health_score']; className?: string }) {
  const { overall } = healthScore;
  const clampedScore = Math.max(0, Math.min(100, overall));
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="flex items-center space-x-1">
        <div className={cn("w-2 h-2 rounded-full", getScoreColor(clampedScore))} />
        <span className="text-sm font-medium">{clampedScore}</span>
      </div>
      <span className="text-xs text-muted-foreground">/ 100</span>
    </div>
  );
}
