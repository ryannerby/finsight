import express from 'express';
import puppeteer from 'puppeteer-core';
import { EnhancedPDFGenerator } from '../export/enhancedPDF';
import { EnhancedExcelGenerator } from '../export/enhancedExcel';
import { SummaryReport } from '../types/summaryReport';
import { ComputedMetrics } from '../types/database';

const router = express.Router();

// Enhanced PDF generation for financial reports
router.post('/pdf/enhanced', async (req, res) => {
  let browser;
  try {
    const { dealId, summaryReport, computedMetrics, options = {} } = req.body;
    const requestId = req.headers['x-request-id'] as string;

    if (!dealId || !summaryReport || !computedMetrics) {
      return res.status(400).json({ 
        error: 'Missing required parameters: dealId, summaryReport, computedMetrics',
        requestId,
        type: 'ValidationError',
        details: 'All required parameters must be provided for PDF generation'
      });
    }

    console.log(`Starting enhanced PDF generation for deal: ${dealId}, requestId: ${requestId}`);

    // Generate enhanced PDF
    const pdfGenerator = new EnhancedPDFGenerator();
    const pdfBuffer = await pdfGenerator.generateReport(
      dealId,
      summaryReport as SummaryReport,
      computedMetrics as ComputedMetrics,
      options
    );

    console.log(`Enhanced PDF generated successfully, size: ${pdfBuffer.length} bytes`);

    // Set headers for PDF download
    const filename = `financial-analysis-${dealId}-${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('x-request-id', requestId);

    res.send(pdfBuffer);

  } catch (error) {
    console.error('Enhanced PDF generation error:', error);
    
    const requestId = req.headers['x-request-id'] as string;
    const errorMessage = error instanceof Error ? error.message : 'PDF generation failed';
    
    if (error instanceof Error && error.name === 'ReportTemplateError') {
      // Handle template validation errors
      const templateError = error as any;
      res.status(400).json({ 
        error: 'Report template validation failed',
        details: errorMessage,
        missingKeys: templateError.missingKeys || [],
        requestId,
        type: 'TemplateError'
      });
    } else {
      // Handle other errors
      res.status(500).json({ 
        error: 'Failed to generate enhanced PDF',
        details: errorMessage,
        requestId,
        type: 'PDFGenerationError'
      });
    }
  }
});

// Enhanced Excel generation for financial reports
router.post('/excel/enhanced', async (req, res) => {
  try {
    const { dealId, summaryReport, computedMetrics, options = {} } = req.body;
    const requestId = req.headers['x-request-id'] as string;

    if (!dealId || !summaryReport || !computedMetrics) {
      return res.status(400).json({ 
        error: 'Missing required parameters: dealId, summaryReport, computedMetrics',
        requestId,
        type: 'ValidationError',
        details: 'All required parameters must be provided for Excel generation'
      });
    }

    console.log(`Starting enhanced Excel generation for deal: ${dealId}`);

    // Validate summary report structure
    if (!summaryReport.health_score || !summaryReport.traffic_lights) {
      return res.status(400).json({ 
        error: 'Invalid summary report structure',
        requestId,
        type: 'ValidationError',
        details: 'Summary report must include health_score and traffic_lights'
      });
    }

    // Generate enhanced Excel
    const excelGenerator = new EnhancedExcelGenerator();
    const excelBuffer = await excelGenerator.generateWorkbook(
      dealId,
      summaryReport as SummaryReport,
      computedMetrics as ComputedMetrics,
      options
    );

    // Set headers for Excel download
    const filename = `financial-analysis-${dealId}-${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', excelBuffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('x-request-id', requestId);

    res.send(excelBuffer);

  } catch (error) {
    console.error('Enhanced Excel generation error:', error);
    
    const requestId = req.headers['x-request-id'] as string;
    const errorMessage = error instanceof Error ? error.message : 'Excel generation failed';
    
    res.status(500).json({ 
      error: 'Failed to generate enhanced Excel',
      details: errorMessage,
      requestId,
      type: 'ExcelGenerationError'
    });
  }
});

// Legacy HTML to PDF conversion (kept for backward compatibility)
router.post('/pdf/legacy', async (req, res) => {
  let page: any = null;
  let browser: any = null;
  const consoleMessages: string[] = [];
  
  try {
    const { html } = req.body;

    if (!html) {
      return res.status(400).json({ error: 'HTML content is required' });
    }

    console.log('Starting legacy PDF generation...');

    // Get executable path from environment or use default
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || 
      (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : 
       process.platform === 'linux' ? '/usr/bin/google-chrome' : 
       process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : undefined);
    
    console.log(`Launching browser with executable: ${executablePath}`);
    
    const launchOptions: any = {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    };
    
    if (executablePath) {
      launchOptions.executablePath = executablePath;
    }
    
    // Add Linux-specific options
    if (process.platform === 'linux') {
      launchOptions.args.push('--no-sandbox', '--disable-setuid-sandbox');
    }

    // Launch browser
    browser = await puppeteer.launch(launchOptions);
    console.log('Browser launched successfully');

    page = await browser.newPage();
    console.log('New page created');
    
    // Capture console messages for debugging
    page.on('console', (msg: any) => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });
    
    page.on('pageerror', (error: any) => {
      consoleMessages.push(`Page Error: ${error.message}`);
    });

    // Set content and wait for it to load
    console.log('Setting HTML content...');
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    console.log('HTML content set successfully');

    console.log('Generating PDF...');
    // Generate PDF with A4 format
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });

    console.log(`Legacy PDF generated successfully, size: ${pdf.length} bytes`);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="deal-summary.pdf"');
    res.setHeader('Content-Length', pdf.length);

    res.send(pdf);

  } catch (error) {
    console.error('Legacy PDF generation error:', error);
    
    // Include console messages in error for debugging
    const consoleOutput = page ? 'Console output: ' + consoleMessages?.join('; ') : 'No console output available';
    const errorMessage = `PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}. ${consoleOutput}`;
    
    res.status(500).json({ 
      error: 'Failed to generate PDF',
      details: errorMessage
    });
  } finally {
    if (page) {
      try {
        await page.close();
        console.log('Page closed successfully');
      } catch (closeError) {
        console.error('Error closing page:', closeError);
      }
    }
    
    if (browser) {
      try {
        await browser.close();
        console.log('Browser closed successfully');
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
  }
});

// Health check endpoint for export services
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    services: {
      enhancedPDF: 'available',
      enhancedExcel: 'available',
      legacyPDF: 'available'
    },
    timestamp: new Date().toISOString()
  });
});

// Get export options and capabilities
router.get('/capabilities', (req, res) => {
  res.json({
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
    },
    limitations: {
      pdf: 'Requires Chrome/Chromium for generation',
      excel: 'Maximum 1,048,576 rows per sheet'
    }
  });
});

export { router as exportRouter }; 