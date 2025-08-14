import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EvidenceDrawer } from './EvidenceDrawer';
import { HealthPanel } from './HealthPanel';
import { InsightsPanel } from './InsightsPanel';
import { SummaryReport } from '../../../../shared/src/types';

// Mock data for testing
const mockSummaryReport: SummaryReport = {
  health_score: {
    overall: 75,
    components: {
      profitability: 80,
      growth: 70,
      liquidity: 65,
      leverage: 85,
      efficiency: 75,
      data_quality: 90
    },
    methodology: "Weighted average of key financial indicators"
  },
  traffic_lights: {
    revenue_quality: {
      status: 'green',
      score: 85,
      reasoning: 'Strong revenue growth with high quality',
      evidence: [{
        type: 'metric',
        ref: 'revenue_growth',
        confidence: 0.9,
        document_id: 'doc_001',
        page: 12,
        context: 'Revenue increased 15% year-over-year'
      }]
    },
    margin_trends: {
      status: 'yellow',
      score: 65,
      reasoning: 'Margins stable but room for improvement',
      evidence: [{
        type: 'metric',
        ref: 'gross_margin',
        confidence: 0.8,
        document_id: 'doc_002',
        page: 8,
        context: 'Gross margin maintained at 68%'
      }]
    },
    liquidity: {
      status: 'red',
      score: 45,
      reasoning: 'Liquidity concerns require attention',
      evidence: [{
        type: 'metric',
        ref: 'working_capital',
        confidence: 0.7,
        document_id: 'doc_003',
        page: 15,
        context: 'Working capital ratio decreased to 1.2x'
      }]
    },
    leverage: {
      status: 'green',
      score: 90,
      reasoning: 'Low leverage with strong debt management',
      evidence: [{
        type: 'metric',
        ref: 'debt_to_equity',
        confidence: 0.95,
        document_id: 'doc_004',
        page: 20,
        context: 'Debt-to-equity ratio at 0.3x'
      }]
    },
    working_capital: {
      status: 'yellow',
      score: 60,
      reasoning: 'Working capital needs monitoring',
      evidence: [{
        type: 'metric',
        ref: 'current_ratio',
        confidence: 0.75,
        document_id: 'doc_005',
        page: 18,
        context: 'Current ratio at 1.5x'
      }]
    },
    data_quality: {
      status: 'green',
      score: 95,
      reasoning: 'Excellent data completeness and accuracy',
      evidence: [{
        type: 'metric',
        ref: 'data_completeness',
        confidence: 0.98,
        document_id: 'doc_006',
        page: 25,
        context: '99% of expected data points available'
      }]
    }
  },
  top_strengths: [
    {
      title: 'Strong Revenue Growth',
      description: 'Consistent 15% year-over-year growth in core business segments',
      impact: 'high',
      evidence: [{
        type: 'metric',
        ref: 'revenue_growth',
        confidence: 0.9,
        document_id: 'doc_001',
        page: 12,
        context: 'Revenue increased 15% year-over-year'
      }]
    },
    {
      title: 'Low Leverage',
      description: 'Conservative debt management with debt-to-equity ratio of 0.3x',
      impact: 'high',
      evidence: [{
        type: 'metric',
        ref: 'debt_to_equity',
        confidence: 0.95,
        document_id: 'doc_004',
        page: 20,
        context: 'Debt-to-equity ratio at 0.3x'
      }]
    }
  ],
  top_risks: [
    {
      title: 'Liquidity Concerns',
      description: 'Working capital ratio decreased to 1.2x, requiring monitoring',
      impact: 'medium',
      evidence: [{
        type: 'metric',
        ref: 'working_capital',
        confidence: 0.7,
        document_id: 'doc_003',
        page: 15,
        context: 'Working capital ratio decreased to 1.2x'
      }]
    },
    {
      title: 'Margin Pressure',
      description: 'Gross margins stable but facing competitive pressure',
      impact: 'medium',
      evidence: [{
        type: 'metric',
        ref: 'gross_margin',
        confidence: 0.8,
        document_id: 'doc_002',
        page: 8,
        context: 'Gross margin maintained at 68%'
      }]
    }
  ],
  recommendation: {
    decision: 'Caution',
    confidence: 0.8,
    rationale: 'Strong fundamentals with some areas requiring attention',
    key_factors: ['Revenue growth', 'Low leverage', 'Liquidity monitoring needed'],
    valuation_impact: 'Moderate upside with risk mitigation',
    deal_structure_notes: 'Consider working capital covenants'
  },
  analysis_metadata: {
    period_range: {
      start: '2023-01-01',
      end: '2023-12-31',
      total_periods: 12
    },
    data_quality: {
      completeness: 0.95,
      consistency: 0.9,
      recency: 1.0,
      missing_periods: [],
      data_gaps: ['Q2 working capital data'],
      reliability_notes: ['High confidence in financial metrics']
    },
    assumptions: ['Revenue growth continues at 15%', 'Margins remain stable'],
    limitations: ['Limited forward-looking data', 'Industry comparison data unavailable'],
    followup_questions: ['Working capital improvement plans?', 'Margin sustainability measures?']
  },
  confidence: {
    overall: 0.8,
    sections: {
      'health_score': 0.85,
      'traffic_lights': 0.8,
      'recommendation': 0.75
    },
    reliability_factors: ['High data quality', 'Consistent methodology', 'Clear evidence trail']
  },
  export_ready: {
    pdf_title: 'Financial Health Analysis Report',
    executive_summary: 'Company shows strong fundamentals with 75/100 health score, but liquidity requires attention.',
    key_metrics_table: [
      {
        metric: 'Overall Health Score',
        value: '75/100',
        trend: 'stable',
        benchmark: 'Industry: 70/100'
      }
    ]
  }
};

export default function IntegrationTest() {
  const [testMode, setTestMode] = useState<'health' | 'insights' | 'direct'>('health');

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">EvidenceDrawer Integration Test</h1>
          <p className="text-lg text-muted-foreground">
            Test the EvidenceDrawer integration across different components
          </p>
        </div>

        {/* Test Mode Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Test Mode Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                variant={testMode === 'health' ? 'default' : 'outline'}
                onClick={() => setTestMode('health')}
              >
                Test HealthPanel Integration
              </Button>
              <Button
                variant={testMode === 'insights' ? 'default' : 'outline'}
                onClick={() => setTestMode('insights')}
              >
                Test InsightsPanel Integration
              </Button>
              <Button
                variant={testMode === 'direct' ? 'default' : 'outline'}
                onClick={() => setTestMode('direct')}
              >
                Test Direct EvidenceDrawer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <div className="space-y-6">
          {testMode === 'health' && (
            <Card>
              <CardHeader>
                <CardTitle>HealthPanel with EvidenceDrawer Integration</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Click the Evidence buttons in the metrics below to test the integration
                </p>
              </CardHeader>
              <CardContent>
                <HealthPanel summaryReport={mockSummaryReport} />
              </CardContent>
            </Card>
          )}

          {testMode === 'insights' && (
            <Card>
              <CardHeader>
                <CardTitle>InsightsPanel with EvidenceDrawer Integration</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Click the View Evidence buttons to test the integration
                </p>
              </CardHeader>
              <CardContent>
                <InsightsPanel 
                  strengths={mockSummaryReport.top_strengths}
                  risks={mockSummaryReport.top_risks}
                />
              </CardContent>
            </Card>
          )}

          {testMode === 'direct' && (
            <Card>
              <CardHeader>
                <CardTitle>Direct EvidenceDrawer Test</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Test the EvidenceDrawer component directly
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="mb-4">This would show a direct EvidenceDrawer test</p>
                  <p className="text-sm text-muted-foreground">
                    The EvidenceDrawer is now integrated into HealthPanel and InsightsPanel above
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <span className="text-green-600 font-bold">1.</span>
                <div>
                  <p className="font-medium">HealthPanel Integration Test</p>
                  <p className="text-sm text-muted-foreground">
                    Select "Test HealthPanel Integration" and click Evidence buttons in the metrics
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-bold">2.</span>
                <div>
                  <p className="font-medium">InsightsPanel Integration Test</p>
                  <p className="text-sm text-muted-foreground">
                    Select "Test InsightsPanel Integration" and click View Evidence buttons
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-purple-600 font-bold">3.</span>
                <div>
                  <p className="font-medium">Accessibility Testing</p>
                  <p className="text-sm text-muted-foreground">
                    Test keyboard navigation (Tab, Enter, Escape) and screen reader compatibility
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-orange-600 font-bold">4.</span>
                <div>
                  <p className="font-medium">Responsive Testing</p>
                  <p className="text-sm text-muted-foreground">
                    Resize browser window to test mobile vs desktop behavior
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
