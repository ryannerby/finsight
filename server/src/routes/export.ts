import express from 'express';
import puppeteer from 'puppeteer-core';

const router = express.Router();

// POST /api/export
// Takes HTML content and returns a PDF
router.post('/', async (req, res) => {
  let browser;
  try {
    const { html } = req.body;

    if (!html) {
      return res.status(400).json({ error: 'HTML content is required' });
    }

    console.log('Starting PDF generation...');

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

    console.log(`PDF generated successfully, size: ${pdf.length} bytes`);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="deal-summary.pdf"');
    res.setHeader('Content-Length', pdf.length);

    res.send(pdf);

  } catch (error) {
    console.error('PDF generation error:', error);
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

export { router as exportRouter }; 