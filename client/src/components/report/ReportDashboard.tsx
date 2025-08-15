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
// ExportButtons removed - using ExportMenu from AppShell instead

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
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [reportType, setReportType] = useState<'comprehensive' | 'financial_summary' | 'risk_assessment' | 'due_diligence'>('comprehensive');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMessage, setGenerationMessage] = useState<string | null>(null);

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

  // Handle report generation
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setGenerationMessage('Starting report generation...');
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setGenerationMessage('Report generated successfully!');
      setTimeout(() => {
        setShowGenerateForm(false);
        setGenerationMessage(null);
      }, 3000);
    } catch (error) {
      setGenerationMessage('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

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
      <div className="space-y-8">
        {/* Header with Export - Centered and properly wrapped */}
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Enhanced Financial Report</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Comprehensive analysis with evidence tracking and AI-powered insights
            </p>
          </div>
          
          {/* Generate Report Button - Centered below title */}
          <div className="flex justify-center">
            <Button 
              onClick={() => setShowGenerateForm(!showGenerateForm)}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
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

        {/* Generate Report Form */}
        {showGenerateForm && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-3">Generate New Report</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                  className="w-full p-2 border border-blue-300 rounded-md text-sm"
                >
                  <option value="comprehensive">Comprehensive Analysis</option>
                  <option value="financial_summary">Financial Summary</option>
                  <option value="risk_assessment">Risk Assessment</option>
                  <option value="due_diligence">Due Diligence</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleGenerateReport}
                  disabled={isGeneratingReport}
                  className="w-full"
                >
                  {isGeneratingReport ? 'Generating...' : 'Start Generation'}
                </Button>
              </div>
            </div>
            
            {/* Generation Status Messages */}
            {generationMessage && (
              <div className={`p-3 rounded-md text-sm ${
                generationMessage.includes('Error') || generationMessage.includes('Failed') 
                  ? 'bg-red-100 text-red-800 border border-red-200' 
                  : 'bg-green-100 text-green-800 border border-green-200'
              }`}>
                {generationMessage}
              </div>
            )}
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Quality Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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

          <Card className="md:col-span-1 xl:col-span-2">
            <CardHeader>
              <CardTitle>Confidence Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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
                <div className="space-y-3">
                  {report.analysis_metadata.followup_questions.map((question, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
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
