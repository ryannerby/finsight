import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockEnhancedReport } from './mockEnhancedReport';
import { HealthPanel } from '../results/HealthPanel';
import { InsightsPanel } from '../results/InsightsPanel';
import { Recommendation } from './Recommendation';
import { ReportDashboard } from './ReportDashboard';

/**
 * Demo page showcasing all enhanced report components
 */
export default function ReportDemo() {
  const handleExport = (format: 'pdf' | 'xlsx') => {
    console.log(`Exporting report in ${format} format`);
    // In a real app, this would trigger the export functionality
  };

  const handleRefresh = () => {
    console.log('Refreshing report data');
    // In a real app, this would refetch the report
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Enhanced Financial Report Components</h1>
        <p className="text-lg text-gray-600">
          Comprehensive financial analysis dashboard with evidence-backed insights
        </p>
      </div>

      {/* Individual Component Showcase */}
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Individual Components</CardTitle>
            <p className="text-sm text-muted-foreground">
              Each component can be used independently or as part of the integrated dashboard
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Health Panel - Consolidated Component */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Health Panel Component</h3>
              <HealthPanel summaryReport={mockEnhancedReport} />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-3">Insights Panel Component</h3>
              <InsightsPanel 
                strengths={mockEnhancedReport.top_strengths} 
                risks={mockEnhancedReport.top_risks} 
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-3">Recommendation Component</h3>
              <Recommendation recommendation={mockEnhancedReport.recommendation} />
            </div>
          </CardContent>
        </Card>

        {/* Integrated Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Integrated Report Dashboard</CardTitle>
            <p className="text-sm text-muted-foreground">
              Complete dashboard with tabbed navigation and export functionality
            </p>
          </CardHeader>
          <CardContent>
            <ReportDashboard
              report={mockEnhancedReport}
              onRefresh={handleRefresh}
            />
          </CardContent>
        </Card>

        {/* Component Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Key Features</CardTitle>
            <p className="text-sm text-muted-foreground">
              What makes these components powerful for financial analysis
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-green-700">Evidence-Backed Analysis</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Every finding links to specific financial metrics</li>
                  <li>• Confidence scores for all evidence</li>
                  <li>• Traceable data sources and calculations</li>
                  <li>• No hallucinated or unsupported claims</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-700">Interactive Experience</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Expandable sections for detailed views</li>
                  <li>• Evidence popovers with source details</li>
                  <li>• Tabbed navigation for organized review</li>
                  <li>• Mobile-responsive design</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-purple-700">Professional Output</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Export-ready PDF and Excel formats</li>
                  <li>• Executive summary and key metrics</li>
                  <li>• Data quality assessment</li>
                  <li>• Follow-up questions for management</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-orange-700">Risk Assessment</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Traffic light system for quick insights</li>
                  <li>• Impact and urgency classification</li>
                  <li>• Quantified risk estimates</li>
                  <li>• Deal structure recommendations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Structure */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Data Structure</CardTitle>
            <p className="text-sm text-muted-foreground">
              The enhanced SummaryReport schema provides comprehensive financial insights
            </p>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-xs text-gray-700 overflow-x-auto">
{JSON.stringify({
  health_score: "Overall score + 6 component scores",
  traffic_lights: "6 key metrics with status, reasoning, evidence",
  top_strengths: "3-7 strengths with impact assessment",
  top_risks: "3-7 risks with urgency classification", 
  recommendation: "Decision + confidence + rationale + key factors",
  analysis_metadata: "Data quality + assumptions + limitations + follow-up Qs",
  confidence: "Overall + section confidence scores",
  export_ready: "PDF title + executive summary + key metrics table"
}, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
