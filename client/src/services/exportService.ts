import { SummaryReport } from '../../../shared/src/types';

export interface ExportOptions {
  theme?: 'professional' | 'modern' | 'minimal';
  includeCharts?: boolean;
  includeAppendix?: boolean;
  includeRawData?: boolean;
  includeEvidence?: boolean;
}

export interface ExportProgress {
  status: 'preparing' | 'generating' | 'downloading' | 'complete' | 'error';
  progress: number;
  message: string;
  error?: string;
}

export class ExportService {
  private readonly baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  async exportToPDF(
    dealId: string,
    summaryReport: SummaryReport,
    computedMetrics: any,
    options: ExportOptions = {},
    onProgress?: (progress: ExportProgress) => void
  ): Promise<void> {
    try {
      onProgress?.({
        status: 'preparing',
        progress: 0,
        message: 'Preparing PDF export...'
      });

      onProgress?.({
        status: 'generating',
        progress: 25,
        message: 'Generating PDF report...'
      });

      const response = await fetch(`${this.baseUrl}/api/export/pdf/enhanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dealId,
          summaryReport,
          computedMetrics,
          options
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      onProgress?.({
        status: 'downloading',
        progress: 75,
        message: 'Downloading PDF...'
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `financial-analysis-${dealId}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      window.URL.revokeObjectURL(url);

      onProgress?.({
        status: 'complete',
        progress: 100,
        message: 'PDF export completed successfully!'
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      onProgress?.({
        status: 'error',
        progress: 0,
        message: 'Export failed',
        error: errorMessage
      });

      throw error;
    }
  }

  async exportToExcel(
    dealId: string,
    summaryReport: SummaryReport,
    computedMetrics: any,
    options: ExportOptions = {},
    onProgress?: (progress: ExportProgress) => void
  ): Promise<void> {
    try {
      onProgress?.({
        status: 'preparing',
        progress: 0,
        message: 'Preparing Excel export...'
      });

      onProgress?.({
        status: 'generating',
        progress: 25,
        message: 'Generating Excel workbook...'
      });

      const response = await fetch(`${this.baseUrl}/api/export/excel/enhanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dealId,
          summaryReport,
          computedMetrics,
          options
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      onProgress?.({
        status: 'downloading',
        progress: 75,
        message: 'Downloading Excel file...'
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `financial-analysis-${dealId}-${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      window.URL.revokeObjectURL(url);

      onProgress?.({
        status: 'complete',
        progress: 100,
        message: 'Excel export completed successfully!'
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      onProgress?.({
        status: 'error',
        progress: 0,
        message: 'Export failed',
        error: errorMessage
      });

      throw error;
    }
  }

  async getExportCapabilities(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/export/capabilities`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch export capabilities:', error);
      // Return default capabilities if API call fails
      return {
        formats: {
          pdf: {
            enhanced: true,
            legacy: true,
            options: {
              themes: ['professional', 'modern', 'minimal'],
              pageSizes: ['A4', 'Letter', 'Legal'],
              includeCharts: true,
              includeAppendix: true
            }
          },
          excel: {
            enhanced: true,
            options: {
              themes: ['professional', 'modern', 'minimal'],
              includeCharts: true,
              includeRawData: true,
              includeEvidence: true,
              sheetProtection: true
            }
          }
        }
      };
    }
  }

  async checkExportHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/export/health`);
      return response.ok;
    } catch (error) {
      console.error('Export service health check failed:', error);
      return false;
    }
  }

  // Helper method to validate export data
  validateExportData(
    dealId: string,
    summaryReport: SummaryReport,
    computedMetrics: any
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!dealId) {
      errors.push('Deal ID is required');
    }

    if (!summaryReport) {
      errors.push('Summary report is required');
    } else {
      if (!summaryReport.health_score) {
        errors.push('Summary report must include health score');
      }
      if (!summaryReport.traffic_lights) {
        errors.push('Summary report must include traffic lights');
      }
      if (!summaryReport.recommendation) {
        errors.push('Summary report must include recommendation');
      }
    }

    if (!computedMetrics) {
      errors.push('Computed metrics are required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Helper method to get file size estimate
  getEstimatedFileSize(
    format: 'pdf' | 'xlsx',
    summaryReport: SummaryReport,
    includeCharts: boolean = true
  ): string {
    if (format === 'pdf') {
      // Rough estimate: 50KB base + 10KB per page + 20KB per chart
      const baseSize = 50;
      const pageSize = 10;
      const chartSize = includeCharts ? 20 : 0;
      const estimatedSize = baseSize + (4 * pageSize) + (3 * chartSize);
      return `${estimatedSize} KB`;
    } else {
      // Excel: 30KB base + 5KB per sheet + 2KB per data row
      const baseSize = 30;
      const sheetSize = 5;
      const dataSize = 2;
      const estimatedSize = baseSize + (6 * sheetSize) + (100 * dataSize);
      return `${estimatedSize} KB`;
    }
  }
}

// Export singleton instance
export const exportService = new ExportService();
