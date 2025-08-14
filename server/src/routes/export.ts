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

    if (!dealId || !summaryReport || !computedMetrics) {
      return res.status(400).json({ 
        error: 'Missing required parameters: dealId, summaryReport, computedMetrics' 
      });
    }

    console.log(`Starting enhanced PDF generation for deal: ${dealId}`);

    // Validate summary report structure
    if (!summaryReport.health_score || !summaryReport.traffic_lights) {
      return res.status(400).json({ 
        error: 'Invalid summary report structure' 
      });
    }

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

    res.send(pdfBuffer);

  } catch (error) {
    console.error('Enhanced PDF generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate enhanced PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Enhanced Excel generation for financial reports
router.post('/excel/enhanced', async (req, res) => {
  try {
    const { dealId, summaryReport, computedMetrics, options = {} } = req.body;

    if (!dealId || !summaryReport || !computedMetrics) {
      return res.status(400).json({ 
        error: 'Missing required parameters: dealId, summaryReport, computedMetrics' 
      });
    }

    console.log(`Starting enhanced Excel generation for deal: ${dealId}`);

    // Validate summary report structure
    if (!summaryReport.health_score || !summaryReport.traffic_lights) {
      return res.status(400).json({ 
        error: 'Invalid summary report structure' 
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

    console.log(`Enhanced Excel generated successfully, size: ${excelBuffer.length} bytes`);

    // Set headers for Excel download
    const filename = `financial-analysis-${dealId}-${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', excelBuffer.length);
    res.setHeader('Cache-Control', 'no-cache');

    res.send(excelBuffer);

  } catch (error) {
    console.error('Enhanced Excel generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate enhanced Excel',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Legacy HTML to PDF conversion (kept for backward compatibility)
router.post('/', async (req, res) => {
  let browser;
  try {
    const { html } = req.body;

    if (!html) {
      return res.status(400).json({ error: 'HTML content is required' });
    }

    console.log('Starting legacy PDF generation...');

    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    console.log('Browser launched successfully');

    const page = await browser.newPage();

    // Set content and wait for it to load
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    console.log('HTML content set, generating PDF...');

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
    res.status(500).json({ 
      error: 'Failed to generate PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
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