import { SummaryReport } from '../types/summaryReport';
import { ComputedMetrics } from '../types/database';

export interface MockExportOptions {
  theme?: 'professional' | 'modern' | 'minimal';
  includeCharts?: boolean;
  includeAppendix?: boolean;
  includeRawData?: boolean;
  includeEvidence?: boolean;
}

/**
 * Mock Export Service for testing UI flow without PDF generation
 * This service bypasses all file generation and returns mock responses
 */
export class MockExportService {
  
  /**
   * Mock PDF export - returns success without generating file
   */
  async exportToPDF(
    dealId: string,
    summaryReport: SummaryReport,
    computedMetrics: ComputedMetrics,
    options: MockExportOptions = {}
  ): Promise<Buffer> {
    console.log('Mock: PDF export requested for deal:', dealId);
    console.log('Mock: Options:', options);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return a minimal PDF buffer (just for testing)
    const mockPdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Mock PDF Generated) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
297
%%EOF`;
    
    return Buffer.from(mockPdfContent, 'utf8');
  }

  /**
   * Mock Excel export - returns success without generating file
   */
  async exportToExcel(
    dealId: string,
    summaryReport: SummaryReport,
    computedMetrics: ComputedMetrics,
    options: MockExportOptions = {}
  ): Promise<Buffer> {
    console.log('Mock: Excel export requested for deal:', dealId);
    console.log('Mock: Options:', options);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return a minimal Excel buffer (just for testing)
    const mockExcelContent = 'Mock Excel file content for testing';
    return Buffer.from(mockExcelContent, 'utf8');
  }

  /**
   * Mock CSV export
   */
  async exportToCSV(
    dealId: string,
    summaryReport: SummaryReport,
    computedMetrics: ComputedMetrics,
    options: MockExportOptions = {}
  ): Promise<string> {
    console.log('Mock: CSV export requested for deal:', dealId);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock CSV content
    return `Metric,Value,Status
Health Score,${summaryReport.health_score.overall},${summaryReport.health_score.overall >= 70 ? 'Good' : 'Needs Attention'}
Revenue Quality,${summaryReport.traffic_lights?.revenue_quality || 'Unknown'},-
Margin Trends,${summaryReport.traffic_lights?.margin_trends || 'Unknown'},-
Liquidity,${summaryReport.traffic_lights?.liquidity || 'Unknown'},-
Leverage,${summaryReport.traffic_lights?.leverage || 'Unknown'},-`;
  }
}
