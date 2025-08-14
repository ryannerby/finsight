import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { SummaryReport } from '../../../../shared/src/types/SummaryReport';
import { HealthPanel } from '../results/HealthPanel';
import { InsightsPanel } from '../results/InsightsPanel';
import { Recommendation } from './Recommendation';
import { ExportButtons } from './ExportButtons';

interface ReportDashboardProps {
  report: SummaryReport;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export const ReportDashboard: React.FC<ReportDashboardProps> = ({
  report,
  isLoading = false,
  error = null,
  onRefresh
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Error boundary state
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // Reset error state when report changes
  useEffect(() => {
    if (report) {
      setHasError(false);
      setErrorDetails(null);
    }
  }, [report]);

  // Error boundary handler
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('Report Dashboard Error:', error, errorInfo);
    setHasError(true);
    setErrorDetails(error.message);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Generating enhanced financial report...</p>
          <p className="text-sm text-muted-foreground mt-2">This may take a few minutes</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || hasError) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <span>{error || errorDetails || 'An error occurred while loading the report'}</span>
          </div>
        </div>
        
        {onRefresh && (
          <div className="flex gap-2">
            <Button onClick={onRefresh} variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={() => window.location.reload()} variant="secondary">
              <XCircle className="h-4 w-4 mr-2" />
              Reload Page
            </Button>
          </div>
        )}
      </div>
    );
  }

  // No report state
  if (!report) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Report Available</h3>
        <p className="text-muted-foreground mb-4">
          Generate an enhanced financial report to see detailed analysis
        </p>
        {onRefresh && (
          <Button onClick={onRefresh}>
            Generate Report
          </Button>
        )}
      </div>
    );
  }

  try {
    return (
      <div className="space-y-6">
        {/* Header with Export */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Enhanced Financial Analysis</h1>
            <p className="text-muted-foreground">
              Comprehensive analysis with evidence tracking and actionable insights
            </p>
          </div>
          <ExportButtons 
            dealId="mock-deal-id"
            summaryReport={report}
            computedMetrics={{}}
          />
        </div>

        {/* Export Error Alert */}
        {exportError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span>Export failed: {exportError}</span>
              <Button 
                variant="link" 
                className="p-0 h-auto ml-2 text-red-800"
                onClick={() => setExportError(null)}
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Health Panel - Consolidated Health Score and Traffic Lights */}
        <HealthPanel summaryReport={report} />

        <Separator />

        {/* Insights Panel - Centralized Strengths & Risks */}
        <InsightsPanel 
          strengths={report.top_strengths}
          risks={report.top_risks}
        />

        <Separator />

        {/* Recommendation */}
        <Card>
          <CardHeader>
            <CardTitle>Investment Recommendation</CardTitle>
          </CardHeader>
          <CardContent>
            <Recommendation recommendation={report.recommendation} />
          </CardContent>
        </Card>

        {/* Data Quality & Confidence */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Quality Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Completeness:</span>
                  <Badge variant={report.analysis_metadata.data_quality.completeness > 0.8 ? 'default' : 'secondary'}>
                    {Math.round(report.analysis_metadata.data_quality.completeness * 100)}%
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Consistency:</span>
                  <Badge variant={report.analysis_metadata.data_quality.consistency > 0.8 ? 'default' : 'secondary'}>
                    {Math.round(report.analysis_metadata.data_quality.consistency * 100)}%
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Recency:</span>
                  <Badge variant={report.analysis_metadata.data_quality.recency > 0.8 ? 'default' : 'secondary'}>
                    {Math.round(report.analysis_metadata.data_quality.recency * 100)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Confidence Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Overall Confidence:</span>
                  <Badge variant={report.confidence.overall > 0.8 ? 'default' : report.confidence.overall > 0.6 ? 'secondary' : 'destructive'}>
                    {Math.round(report.confidence.overall * 100)}%
                  </Badge>
                </div>
                {Object.entries(report.confidence.sections).map(([section, confidence]) => (
                  <div key={section} className="flex justify-between">
                    <span className="capitalize">{section.replace('_', ' ')}:</span>
                    <Badge variant={confidence > 0.8 ? 'default' : confidence > 0.6 ? 'secondary' : 'destructive'}>
                      {Math.round(confidence * 100)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Follow-up Questions */}
        {report.analysis_metadata.followup_questions.length > 0 && (
          <>
            <Separator />
            <Card>
              <CardHeader>
                <CardTitle>Follow-up Questions</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Key questions to address during due diligence
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {report.analysis_metadata.followup_questions.map((question, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Badge variant="outline" className="mt-1">Q{index + 1}</Badge>
                      <p className="text-sm">{question}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    );
  } catch (error) {
    // Fallback error boundary
    handleError(error as Error, { componentStack: 'ReportDashboard' });
    return null; // This will trigger the error state above
  }
};
