import { Router, Request, Response } from 'express';
import { MockAnalysisService } from '../services/mockAnalysisService';
import { MockExportService } from '../services/mockExportService';

const router = Router();
const mockAnalysisService = new MockAnalysisService();
const mockExportService = new MockExportService();

// Mock mode indicator
router.get('/status', (req: Request, res: Response) => {
  res.json({ 
    mode: 'mock',
    message: 'Mock mode enabled - no real database operations',
    timestamp: new Date().toISOString()
  });
});

// Mock report generation endpoint
router.post('/report/generate', async (req: Request, res: Response) => {
  try {
    const { deal_id, report_type, title, description, generated_by } = req.body;
    
    if (!deal_id || !generated_by) {
      return res.status(400).json({ 
        error: 'Missing required parameters: deal_id, generated_by' 
      });
    }

    console.log('Mock: Report generation requested for deal:', deal_id);
    
    const result = await mockAnalysisService.generateReport({
      deal_id,
      report_type: report_type || 'comprehensive',
      title: title || `Mock Report - ${deal_id}`,
      description,
      generated_by,
      export_formats: ['pdf'],
      include_evidence: true,
      include_qa: true
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'Mock report generation started successfully',
        report_id: result.report_id,
        status: result.status,
        progress: result.progress,
        estimated_completion: result.estimated_completion
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Mock: Error in report generation:', error);
    res.status(500).json({ 
      error: 'Mock service error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Mock report status endpoint
router.get('/report/:reportId/status', async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;
    
    const status = await mockAnalysisService.getReportStatus(reportId);
    res.json(status);
  } catch (error) {
    console.error('Mock: Error getting report status:', error);
    res.status(500).json({ error: 'Failed to get mock report status' });
  }
});

// Mock PDF export endpoint
router.post('/export/pdf/enhanced', async (req: Request, res: Response) => {
  try {
    const { dealId, summaryReport, computedMetrics, options = {} } = req.body;

    if (!dealId || !summaryReport || !computedMetrics) {
      return res.status(400).json({ 
        error: 'Missing required parameters: dealId, summaryReport, computedMetrics' 
      });
    }

    console.log('Mock: PDF export requested for deal:', dealId);

    // Generate mock PDF
    const pdfBuffer = await mockExportService.exportToPDF(
      dealId,
      summaryReport,
      computedMetrics,
      options
    );

    console.log('Mock: PDF generated successfully, size:', pdfBuffer.length, 'bytes');

    // Set headers for PDF download
    const filename = `mock-financial-analysis-${dealId}-${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-cache');

    res.send(pdfBuffer);

  } catch (error) {
    console.error('Mock: PDF export error:', error);
    res.status(500).json({ 
      error: 'Failed to generate mock PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Mock Excel export endpoint
router.post('/export/excel/enhanced', async (req: Request, res: Response) => {
  try {
    const { dealId, summaryReport, computedMetrics, options = {} } = req.body;

    if (!dealId || !summaryReport || !computedMetrics) {
      return res.status(400).json({ 
        error: 'Missing required parameters: dealId, summaryReport, computedMetrics' 
      });
    }

    console.log('Mock: Excel export requested for deal:', dealId);

    // Generate mock Excel
    const excelBuffer = await mockExportService.exportToExcel(
      dealId,
      summaryReport,
      computedMetrics,
      options
    );

    console.log('Mock: Excel generated successfully, size:', excelBuffer.length, 'bytes');

    // Set headers for Excel download
    const filename = `mock-financial-analysis-${dealId}-${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', excelBuffer.length);
    res.setHeader('Cache-Control', 'no-cache');

    res.send(excelBuffer);

  } catch (error) {
    console.error('Mock: Excel export error:', error);
    res.status(500).json({ 
      error: 'Failed to generate mock Excel',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Mock deals endpoint for testing
router.get('/deals', (req: Request, res: Response) => {
  const mockDeals = [
    {
      id: 'mock-deal-1',
      title: 'Mock Financial Analysis Deal',
      description: 'This is a mock deal for testing the UI flow',
      user_id: 'mock-user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  
  res.json(mockDeals);
});

// Mock deal creation endpoint
router.post('/deals', (req: Request, res: Response) => {
  const { title, description, user_id } = req.body;
  
  if (!title || !user_id) {
    return res.status(400).json({ error: 'Title and user_id are required' });
  }

  const mockDeal = {
    id: `mock-deal-${Date.now()}`,
    title,
    description,
    user_id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  res.status(201).json(mockDeal);
});

export { router as mockRouter };
