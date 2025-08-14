import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HealthScoreRing } from '@/components/ui/health-score-ring';
import { ExportMenu } from '@/components/actions/ExportMenu';
import { Upload, FileText } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
  dealName: string;
  healthScore?: number;
  recommendation?: string;
  dealId: string;
  summaryReport?: any;
  computedMetrics?: any;
  onUploadClick?: () => void;
  className?: string;
}

export function AppShell({
  children,
  dealName,
  healthScore,
  recommendation,
  dealId,
  summaryReport,
  computedMetrics,
  onUploadClick,
  className = ''
}: AppShellProps) {
  const getRecommendationVariant = (rec: string) => {
    switch (rec?.toLowerCase()) {
      case 'proceed':
        return 'success';
      case 'caution':
        return 'warning';
      case 'reject':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {/* Top Action Bar */}
      <div className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Deal name and status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <h1 className="text-xl font-semibold text-foreground">{dealName}</h1>
              </div>
              
              {/* Recommendation pill */}
              {recommendation && (
                <Badge
                  variant={getRecommendationVariant(recommendation)}
                  className="px-3 py-1 text-sm font-medium"
                >
                  {recommendation}
                </Badge>
              )}
              
              {/* Health Score */}
              {healthScore !== undefined && (
                <div className="flex items-center gap-2">
                  <HealthScoreRing
                    score={healthScore}
                    tooltip="Overall deal health based on liquidity, margins, growth, and volatility"
                  />
                  <span className="text-sm font-medium text-muted-foreground">
                    {healthScore}/100
                  </span>
                </div>
              )}
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-3">
              {/* Export Menu */}
              <ExportMenu
                dealId={dealId}
                summaryReport={summaryReport}
                computedMetrics={computedMetrics}
              />
              
              {/* Upload Button */}
              {onUploadClick && (
                <Button
                  onClick={onUploadClick}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-6 py-6">
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
