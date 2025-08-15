import { 
  TReportGenerationRequest, 
  TReportGenerationResponse,
  SummaryReport
} from '../types/analysis';

/**
 * Mock Analysis Service for testing UI flow without database
 * This service bypasses all database operations and returns mock data
 */
export class MockAnalysisService {
  
  /**
   * Generate a mock report (bypasses database)
   */
  async generateReport(request: TReportGenerationRequest): Promise<TReportGenerationResponse> {
    try {
      console.log('Mock: Starting report generation for request:', request);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return success response with mock data
      return {
        success: true,
        report_id: `mock-${Date.now()}`,
        status: 'completed',
        message: 'Mock report generated successfully',
        progress: 100,
        estimated_completion: new Date().toISOString()
      };
    } catch (error) {
      console.error('Mock: Error in report generation:', error);
      return {
        success: false,
        status: 'failed',
        error: 'Mock service error'
      };
    }
  }

  /**
   * Generate mock comprehensive report
   */
  async generateComprehensiveReport(
    dealId: string,
    documents: any[],
    computedMetrics: any
  ): Promise<{
    analysisId: string;
    summaryReport: SummaryReport;
    generationStats: any;
  }> {
    console.log('Mock: Generating comprehensive report for deal:', dealId);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return mock data
    return {
      analysisId: `mock-analysis-${Date.now()}`,
      summaryReport: this.generateMockSummaryReport(),
      generationStats: {
        total_time_ms: 2000,
        claude_usage: { input_tokens: 1000, output_tokens: 500 },
        validation_passed: true
      }
    };
  }

  /**
   * Generate mock summary report
   */
  private generateMockSummaryReport(): SummaryReport {
    return {
      health_score: {
        overall: 75,
        components: {
          profitability: 80,
          growth: 70,
          liquidity: 75,
          leverage: 60,
          efficiency: 70,
          data_quality: 85
        },
        methodology: 'Mock analysis methodology'
      },
      traffic_lights: {
        revenue_quality: { status: 'green', score: 85, reasoning: 'Strong revenue growth', evidence: [] },
        margin_trends: { status: 'yellow', score: 65, reasoning: 'Margins stable but could improve', evidence: [] },
        liquidity: { status: 'green', score: 80, reasoning: 'Good cash position', evidence: [] },
        leverage: { status: 'red', score: 40, reasoning: 'High debt levels', evidence: [] },
        working_capital: { status: 'yellow', score: 60, reasoning: 'Working capital needs attention', evidence: [] },
        data_quality: { status: 'green', score: 85, reasoning: 'High quality data', evidence: [] }
      },
      top_strengths: [
        { title: 'Strong revenue growth', description: 'Consistent revenue growth over periods', impact: 'high', evidence: [] },
        { title: 'Healthy profit margins', description: 'Maintained strong profit margins', impact: 'high', evidence: [] },
        { title: 'Solid market position', description: 'Established market presence', impact: 'medium', evidence: [] }
      ],
      top_risks: [
        { title: 'High debt levels', description: 'Elevated debt-to-equity ratio', impact: 'high', evidence: [] },
        { title: 'Market volatility exposure', description: 'Sensitive to market fluctuations', impact: 'medium', evidence: [] }
      ],
      recommendation: {
        decision: 'Caution',
        confidence: 0.7,
        rationale: 'Company shows promise but has some risk factors',
        key_factors: ['High debt levels', 'Market volatility exposure']
      },
      analysis_metadata: {
        period_range: {
          start: '2023-01-01',
          end: '2023-12-31',
          total_periods: 12
        },
        data_quality: {
          completeness: 0.9,
          consistency: 0.8,
          recency: 0.9,
          missing_periods: [],
          data_gaps: [],
          reliability_notes: ['Mock data quality assessment']
        },
        assumptions: ['Mock assumption 1', 'Mock assumption 2'],
        limitations: ['Mock limitation 1'],
        followup_questions: ['Mock question 1', 'Mock question 2']
      },
      confidence: {
        overall: 0.8,
        sections: { 'financial_metrics': 0.9, 'risk_assessment': 0.7 },
        reliability_factors: ['Mock reliability factor']
      },
      export_ready: {
        pdf_title: 'Mock Financial Analysis Report',
        executive_summary: 'Mock executive summary',
        key_metrics_table: [
          { metric: 'Revenue Growth', value: '15%', trend: 'improving' },
          { metric: 'Profit Margin', value: '12%', trend: 'stable' }
        ]
      }
    };
  }

  /**
   * Get mock report status
   */
  async getReportStatus(reportId: string): Promise<any> {
    return {
      report_id: reportId,
      status: 'completed',
      progress: 100,
      last_modified: new Date().toISOString()
    };
  }
}
