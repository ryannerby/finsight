import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { EvidencePopover } from './EvidencePopover';
import { SummaryReport, TrafficLight, Evidence } from '../../../../shared/src/types';

interface TrafficLightsProps {
  trafficLights: SummaryReport['traffic_lights'];
  className?: string;
}

/**
 * Traffic Lights Component
 * Displays financial metrics in a 6-panel grid with color coding and evidence
 */
export function TrafficLights({ trafficLights, className }: TrafficLightsProps) {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Convert traffic lights object to array for grid display
  const metricsArray = Object.entries(trafficLights).map(([key, trafficLight]) => {
    const labels: Record<string, { label: string; description: string }> = {
      revenue_quality: { 
        label: 'Revenue Quality', 
        description: 'Growth consistency, customer concentration, seasonality patterns' 
      },
      margin_trends: { 
        label: 'Margin Trends', 
        description: 'Gross/net margin evolution, cost structure efficiency' 
      },
      liquidity: { 
        label: 'Liquidity', 
        description: 'Current ratio, cash conversion cycle, working capital trends' 
      },
      leverage: { 
        label: 'Leverage', 
        description: 'Debt ratios, coverage ratios, debt service capacity' 
      },
      working_capital: { 
        label: 'Working Capital', 
        description: 'Days sales outstanding, inventory turns, payable patterns' 
      },
      data_quality: { 
        label: 'Data Quality', 
        description: 'Completeness, consistency, recency of financial information' 
      }
    };

    const defaultInfo = labels[key] || { label: key, description: 'Financial metric' };
    
    return {
      key,
      label: defaultInfo.label,
      status: trafficLight.status,
      score: trafficLight.score,
      reasoning: trafficLight.reasoning,
      evidence: trafficLight.evidence,
      description: defaultInfo.description
    };
  });

  const getStatusColor = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green':
        return 'bg-green-500 border-green-600';
      case 'yellow':
        return 'bg-yellow-500 border-yellow-600';
      case 'red':
        return 'bg-red-500 border-red-600';
      default:
        return 'bg-gray-400 border-gray-500';
    }
  };

  const getStatusText = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green':
        return 'Good';
      case 'yellow':
        return 'Caution';
      case 'red':
        return 'Risk';
      default:
        return 'N/A';
    }
  };

  const getStatusDescription = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green':
        return 'Within acceptable range';
      case 'yellow':
        return 'Requires attention';
      case 'red':
        return 'Immediate action needed';
      default:
        return 'No data available';
    }
  };

  return (
    <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Financial Health Indicators</CardTitle>
          <p className="text-sm text-muted-foreground">
            Key metrics with traffic light status and supporting evidence
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {metricsArray.map((metric) => (
              <div
                key={metric.key}
                className={cn(
                  "relative p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md",
                  'bg-white cursor-pointer hover:scale-105'
                )}
                onClick={() => setSelectedMetric(metric.key)}
              >
                {/* Traffic Light Indicator */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={cn(
                      "w-3 h-3 rounded-full border-2",
                      getStatusColor(metric.status)
                    )} />
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-xs",
                        metric.status === 'green' && 'border-green-200 text-green-700',
                        metric.status === 'yellow' && 'border-yellow-200 text-yellow-700',
                        metric.status === 'red' && 'border-red-200 text-red-700'
                      )}
                    >
                      {getStatusText(metric.status)}
                    </Badge>
                  </div>
                  
                  {/* Evidence indicator */}
                  {metric.evidence && metric.evidence.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {metric.evidence.length} evidence item{metric.evidence.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                {/* Metric Label */}
                <h4 className="font-medium text-sm mb-2 text-gray-900">
                  {metric.label}
                </h4>

                {/* Metric Score */}
                <div className="text-lg font-bold text-gray-900 mb-2">
                  {metric.score}
                  <span className="text-sm text-muted-foreground ml-1">/ 100</span>
                </div>

                {/* Reasoning */}
                <p className="text-xs text-gray-700 mb-3 leading-relaxed">
                  {metric.reasoning}
                </p>

                {/* Description */}
                <p className="text-xs text-muted-foreground mb-3">
                  {metric.description}
                </p>

                {/* Evidence Popover Trigger */}
                {metric.evidence && metric.evidence.length > 0 && (
                  <div className="absolute bottom-2 right-2">
                    <EvidencePopover
                      evidence={metric.evidence.map((evidence: Evidence, idx: number) => ({
                        id: evidence.ref || `evidence-${idx}`,
                        title: `${evidence.type} - ${evidence.ref}`,
                        description: evidence.context || evidence.quote || `Evidence from ${evidence.type}`,
                        confidence: evidence.confidence,
                        source: evidence.document_id,
                        page: evidence.page,
                        documentType: evidence.type
                      }))}
                      trigger={
                        <div className="w-11 h-11 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                          <span className="text-xs text-blue-600 font-medium">i</span>
                        </div>
                      }
                    />
                  </div>
                )}

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500 border border-green-600" />
                <span>Good - Within acceptable range</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500 border border-yellow-600" />
                <span>Caution - Requires attention</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500 border border-red-600" />
                <span>Risk - Immediate action needed</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
  );
}

/**
 * Compact Traffic Lights Component
 * Smaller version for use in summary views
 */
export function TrafficLightsCompact({ trafficLights, className }: { trafficLights: SummaryReport['traffic_lights']; className?: string }) {
  const metricCount = Object.keys(trafficLights).length;
  const greenCount = Object.values(trafficLights).filter((tl: TrafficLight) => tl.status === 'green').length;
  const yellowCount = Object.values(trafficLights).filter((tl: TrafficLight) => tl.status === 'yellow').length;
  const redCount = Object.values(trafficLights).filter((tl: TrafficLight) => tl.status === 'red').length;

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
        {greenCount}/{metricCount} indicators healthy
      </span>
    </div>
  );
}
