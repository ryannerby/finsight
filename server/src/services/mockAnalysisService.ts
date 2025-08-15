import { 
  TReportGenerationRequest, 
  TReportGenerationResponse,
  SummaryReport,
  ComputedMetrics
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
      health_score: 75,
      traffic_lights: {
        financial_health: 'green',
        operational_efficiency: 'yellow',
        market_position: 'green',
        risk_factors: 'red'
      },
      strengths: [
        'Strong revenue growth',
        'Healthy profit margins',
        'Solid market position'
      ],
      risks: [
        'High debt levels',
        'Market volatility exposure'
      ],
      recommendation: {
        action: 'Proceed with caution',
        confidence: 0.7,
        reasoning: 'Company shows promise but has some risk factors'
      },
      evidence_map: {},
      confidence_scores: {},
      data_quality_assessment: {
        overall_score: 0.8,
        completeness: 0.9,
        accuracy: 0.7
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
