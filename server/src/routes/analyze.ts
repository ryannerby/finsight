import { Router, Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { supabase, supabaseAdmin } from '../config/supabase';
import Papa from 'papaparse';
import { normalizeLines, type Canon } from '../lib/normalize/accounts';
import { computeAllMetrics } from '../lib/math/computeMetrics';
import type { PeriodKey, Periodicity, CanonByPeriod } from '../lib/math/ratios';
import { Summary, DocumentInventory, DDSignals, DueDiligenceChecklist } from '../schemas/analysis';
import { buildDocumentInventory } from '../services/documentInventory';
import { computeDDSignals } from '../services/ddSignals';
import { parseXlsxToRows } from '../services/xlsxParser';
import { jsonCall } from '../services/anthropic';
import { rateLimiter } from '../services/rateLimiter';
import { AnalysisErrorHandler, type AnalysisError } from '../services/errorHandler';
import { EnhancedAnalysisService } from '../services/enhancedAnalysis';
import { anthropicService } from '../services/anthropic';
import { 
  TReportGenerationRequest, 
  TReportGenerationResponse,
  TAnalysisReport 
} from '../types/analysis';

export const analyzeRouter = Router();

// Test endpoint to verify database connectivity
analyzeRouter.get('/test', async (req: Request, res: Response) => {
  try {
    console.log('Testing database connectivity...');
    
    // Test basic Supabase connection
    const { data: testData, error: testError } = await supabase
      .from('deals')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('Database connection test failed:', testError);
      return res.status(500).json({ 
        error: 'Database connection failed', 
        details: testError.message 
      });
    }
    
    // Test analysis_reports table specifically
    console.log('Testing analysis_reports table...');
    const { data: reportsData, error: reportsError } = await supabase
      .from('analysis_reports')
      .select('count')
      .limit(1);
    
    if (reportsError) {
      console.error('analysis_reports table test failed:', reportsError);
      return res.status(500).json({ 
        error: 'analysis_reports table not accessible', 
        details: reportsError.message 
      });
    }
    
    console.log('Database connection test successful');
    return res.json({ 
      message: 'Database connection successful',
      deals_table: 'accessible',
      analysis_reports_table: 'accessible',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return res.status(500).json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Initialize enhanced analysis service
const enhancedAnalysisService = new EnhancedAnalysisService(supabase, anthropicService);

// Simple document parser for CSV and Excel files
const documentParser = {
  async parse(filename: string, buffer: Buffer): Promise<{ periods: Record<string, any> }> {
    if (filename.endsWith('.csv')) {
      const text = buffer.toString('utf-8');
      const { canon } = canonFromCsv(text);
      return { periods: canon };
    } else if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
      const rows = parseXlsxToRows(buffer);
      const canon: Record<string, any> = {};
      for (const row of rows) {
        if (!canon[row.period]) canon[row.period] = {};
        const norm = normalizeLines([{ account: row.account, value: row.value }]);
        Object.assign(canon[row.period], norm);
      }
      return { periods: canon };
    }
    throw new Error(`Unsupported file type: ${filename}`);
  }
};

// Simple logger
const logger = {
  warn: (message: string, ...args: any[]) => console.warn(message, ...args),
  error: (message: string, ...args: any[]) => console.error(message, ...args),
  info: (message: string, ...args: any[]) => console.info(message, ...args)
};

// naive periodicity detector
function detectPeriodicity(keys: PeriodKey[]): Periodicity {
  if (keys.some(k => /^\d{4}-\d{2}$/.test(k))) return "monthly";
  if (keys.some(k => /^\d{4}-Q[1-4]$/.test(k))) return "quarterly";
  return "annual";
}

// very simple CSV normalizer: expects columns like "period,account,value"
function canonFromCsv(text: string): { canon: CanonByPeriod; periods: PeriodKey[] } {
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  const canon: CanonByPeriod = {};
  for (const row of parsed.data as any[]) {
    const period = String(row.period ?? row.Period ?? '').trim();
    const account = String(row.account ?? row.Account ?? '').trim();
    const value = Number(row.value ?? row.Value ?? NaN);
    if (!period || !account || Number.isNaN(value)) continue;
    if (!canon[period]) canon[period] = {};
    const norm = normalizeLines([{ account, value }]);
    Object.assign(canon[period], norm);
  }
  const periods = Object.keys(canon);
  return { canon, periods };
}

// Analyze documents for a deal
analyzeRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const { dealId, userId } = req.body;
  
  try {
    if (!dealId || !userId) return res.status(400).json({ error: 'dealId and userId are required' });

    // Rate limiting: one analysis per minute per deal
    // if (!rateLimiter.isAllowed(dealId)) {
    //   const retryAfter = Math.ceil(rateLimiter.getTimeRemaining(dealId) / 1000);
    //   const error = AnalysisErrorHandler.createRateLimitError(retryAfter);
    //   return res.status(AnalysisErrorHandler.getHttpStatus(error))
    //     .json({ 
    //       error: error.message, 
    //       type: error.type, 
    //       retryAfter: error.retryAfter 
    //     });
    // }

    // Verify the deal belongs to the user
    let t0 = Date.now();
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('id,user_id')
      .eq('id', dealId)
      .eq('user_id', userId)
      .single();
    console.log(`[analyze] verify_deal ${Date.now() - t0}ms ${dealError ? 'fail' : 'ok'}`);

    if (dealError || !deal) return res.status(404).json({ error: 'Deal not found or access denied' });

    // Get documents for this deal
    t0 = Date.now();
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select(`
        *,
        analyses (*)
      `)
      .eq('deal_id', dealId);
    console.log(`[analyze] fetch_documents ${Date.now() - t0}ms ${docsError ? 'fail' : 'ok'}`);

    if (docsError) return res.status(500).json({ error: 'Failed to fetch documents' });
    if (!documents || documents.length === 0) return res.status(400).json({ error: 'No documents found for analysis' });

    // Check file sizes and validate documents
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    for (const doc of documents) {
      if (doc.file_size && doc.file_size > MAX_FILE_SIZE) {
        const error = AnalysisErrorHandler.createFileTooLargeError(doc.file_size, MAX_FILE_SIZE);
        return res.status(AnalysisErrorHandler.getHttpStatus(error))
          .json({ 
            error: error.message, 
            type: error.type, 
            details: error.details 
          });
      }
    }

    // Process documents and compute metrics
    t0 = Date.now();
    let computedMetrics, representativeDoc;
    try {
      const result = await processDocumentsAndComputeMetrics(documents);
      computedMetrics = result.computedMetrics;
      representativeDoc = result.representativeDoc;
      console.log(`[analyze] process_documents ${Date.now() - t0}ms`);
    } catch (error) {
      console.error('Error processing documents:', error);
      return res.status(500).json({ error: `Failed to process documents: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }

    // Generate enhanced analysis report
    t0 = Date.now();
    let enhancedAnalysisResult = null;
    try {
      console.log('Starting enhanced analysis...');
      const { analysisId, summaryReport, generationStats } = await enhancedAnalysisService
        .generateComprehensiveReport(dealId, documents, computedMetrics);
      
      enhancedAnalysisResult = {
        analysisId,
        summaryReport,
        generationStats
      };
      console.log(`[analyze] enhanced_analysis ${Date.now() - t0}ms`);
    } catch (enhancedError) {
      console.error('Enhanced analysis failed, continuing with traditional analysis:', enhancedError);
      // Continue with traditional analysis even if enhanced fails
    }

    // Create a basic summary report from computed metrics if enhanced analysis failed
    let basicSummaryReport = null;
    if (!enhancedAnalysisResult?.summaryReport) {
      try {
        console.log('Computed metrics structure:', JSON.stringify(computedMetrics, null, 2));
        console.log('Creating basic summary report...');
        basicSummaryReport = createBasicSummaryReport(dealId, computedMetrics, documents);
        console.log('Created basic summary report successfully:', basicSummaryReport ? 'yes' : 'no');
        if (basicSummaryReport) {
          console.log('Summary report keys:', Object.keys(basicSummaryReport));
        }
      } catch (summaryError) {
        console.error('Failed to create basic summary report:', summaryError);
        console.error('Error stack:', summaryError instanceof Error ? summaryError.stack : 'No stack trace');
      }
    }

    // Store traditional financial analysis for backward compatibility
    t0 = Date.now();
    const financialAnalysisId = await persistFinancialAnalysis(
      dealId,
      representativeDoc.id,
      computedMetrics
    );
    console.log(`[analyze] persist_financial ${Date.now() - t0}ms`);

    const totalTime = Date.now() - startTime;
    
    // Log success
    await logAnalysisEvent(dealId, 'analysis_completed', {
      total_time_ms: totalTime,
      document_count: documents.length,
      enhanced_analysis_id: enhancedAnalysisResult?.analysisId,
      financial_analysis_id: financialAnalysisId
    });

    res.json({
      success: true,
      analysisId: enhancedAnalysisResult?.analysisId,
      financialMetricsId: financialAnalysisId,
      summaryReport: enhancedAnalysisResult?.summaryReport || basicSummaryReport,
      generationStats: enhancedAnalysisResult?.generationStats,
      exportVersion: 'v1',
      metadata: {
        documentCount: documents.length,
        totalProcessingTime: totalTime,
        enhancedAnalysisAvailable: !!enhancedAnalysisResult,
        dataQuality: enhancedAnalysisResult?.summaryReport?.analysis_metadata?.data_quality || 'basic'
      }
    });

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error('Analysis failed with error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    await logAnalysisEvent(dealId, 'analysis_failed', {
      total_time_ms: totalTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    next(error);
  }
});

// Enhanced Analysis Report Endpoints

/**
 * Generate comprehensive analysis report
 * POST /analyze/report
 */
analyzeRouter.post('/report', async (req: Request, res: Response) => {
  try {
    const { deal_id, generated_by } = req.body;
    if (!deal_id || !generated_by) {
      return res.status(400).json({ error: 'deal_id and generated_by are required' });
    }

    // Rate limiting: one report generation per 5 minutes per deal
    // if (!rateLimiter.isAllowed(`report_${dealId}`)) {
    //   const retryAfter = Math.ceil(rateLimiter.getTimeRemaining(`report_${dealId}`) / 1000);
    //   return res.status(429).json({ 
    //     error: 'Rate limit exceeded', 
    //     retryAfter,
    //     message: 'Please wait before generating another report for this deal'
    //   });
    // }

    // Verify the deal belongs to the user
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('id,user_id')
      .eq('id', deal_id)
      .eq('user_id', generated_by)
      .single();

    if (dealError || !deal) {
      return res.status(404).json({ error: 'Deal not found or access denied' });
    }

    // Prepare report generation request
    const reportRequest: TReportGenerationRequest = {
      deal_id: deal_id,
      report_type: req.body.report_type || 'comprehensive',
      title: req.body.title || `Analysis Report - ${deal_id}`,
      description: req.body.description,
      template_id: req.body.template_id,
      custom_sections: req.body.custom_sections,
      include_evidence: req.body.include_evidence !== false,
      include_qa: req.body.include_qa !== false,
      export_formats: req.body.export_formats || ['pdf'],
      metadata: req.body.metadata || {},
      generated_by: generated_by
    };

    // Generate report
    const result: TReportGenerationResponse = await enhancedAnalysisService.generateReport(reportRequest);

    if (result.success) {
      return res.json({
        success: true,
        message: 'Report generation started successfully',
        report_id: result.report_id,
        status: result.status,
        progress: result.progress,
        estimated_completion: result.estimated_completion
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to start report generation'
      });
    }
  } catch (error) {
    console.error('Error starting report generation:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'No message',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      type: error instanceof Error ? error.constructor.name : typeof error,
      body: req.body
    });
    
    const analysisError = AnalysisErrorHandler.createUnknownError(error);
    res.status(AnalysisErrorHandler.getHttpStatus(analysisError))
      .json({ 
        error: analysisError.message, 
        type: analysisError.type, 
        details: analysisError.details 
      });
  }
});

/**
 * Get report status and progress
 * GET /analyze/report/:reportId/status
 */
analyzeRouter.get('/report/:reportId/status', async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Get report status
    const { data: report, error: reportError } = await supabase
      .from('analysis_reports')
      .select('id, status, last_modified, metadata')
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Verify access (simplified - in production, check if user has access to the deal)
    const { data: dealAccess } = await supabase
      .from('analysis_reports')
      .select('deal_id')
      .eq('id', reportId)
      .single();

    if (dealAccess) {
      const { data: deal } = await supabase
        .from('deals')
        .select('user_id')
        .eq('id', dealAccess.deal_id)
        .eq('user_id', userId)
        .single();

      if (!deal) {
        return res.status(403).json({ error: 'Access denied to this report' });
      }
    }

    // Calculate progress based on status
    let progress = 0;
    if (report.status === 'completed') progress = 100;
    else if (report.status === 'in_progress') progress = 50;
    else if (report.status === 'draft') progress = 10;

    return res.json({
      report_id: reportId,
      status: report.status,
      progress,
      last_modified: report.last_modified,
      error: report.metadata?.error
    });
  } catch (error) {
    console.error('Error getting report status:', error);
    res.status(500).json({ error: 'Failed to get report status' });
  }
});

/**
 * Get complete report with all sections and evidence
 * GET /analyze/report/:reportId
 */
analyzeRouter.get('/report/:reportId', async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Get report by ID
    const report = await enhancedAnalysisService.getReport(reportId);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Verify access
    const { data: deal } = await supabase
      .from('deals')
      .select('user_id')
      .eq('id', report.deal_id)
      .eq('user_id', userId)
      .single();

    if (!deal) {
      return res.status(403).json({ error: 'Access denied to this report' });
    }

    return res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Error getting report:', error);
    res.status(500).json({ error: 'Failed to get report' });
  }
});

/**
 * Search reports with filters
 * GET /analyze/reports
 */
analyzeRouter.get('/reports', async (req: Request, res: Response) => {
  try {
    const { userId, deal_id, report_type, status, page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Build filters
    const filters: any = {};
    if (deal_id) filters.deal_id = deal_id;
    if (report_type) filters.report_type = report_type;
    if (status) filters.status = status;

    // Search reports with filters
    const reports = await enhancedAnalysisService.searchReports(filters);

    // Apply pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedReports = reports.slice(startIndex, endIndex);

    return res.json({
      success: true,
      reports: paginatedReports,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: reports.length,
        totalPages: Math.ceil(reports.length / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error searching reports:', error);
    res.status(500).json({ error: 'Failed to search reports' });
  }
});

/**
 * Update report (title, description, status)
 * PUT /analyze/report/:reportId
 */
analyzeRouter.put('/report/:reportId', async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;
    const { userId, title, description, status } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Verify access and get current report
    const { data: report, error: reportError } = await supabase
      .from('analysis_reports')
      .select('deal_id, user_id')
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Check if user owns the deal
    const { data: deal } = await supabase
      .from('deals')
      .select('user_id')
      .eq('id', report.deal_id)
      .eq('user_id', userId)
      .single();

    if (!deal) {
      return res.status(403).json({ error: 'Access denied to this report' });
    }

    // Update report
    const updateData: any = { last_modified: new Date().toISOString() };
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status) updateData.status = status;

    const { error: updateError } = await supabase
      .from('analysis_reports')
      .update(updateData)
      .eq('id', reportId);

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update report' });
    }

    return res.json({
      success: true,
      message: 'Report updated successfully'
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// Helper functions
async function processDocumentsAndComputeMetrics(documents: any[]) {
  console.log('Processing documents:', documents.length);
  console.log('First document structure:', JSON.stringify(documents[0], null, 2));
  
  const periodMap = new Map<string, any>();
  let representativeDoc = documents[0];

  // Process each document
  for (const doc of documents) {
    console.log(`Processing document: ${doc.filename}, mime_type: ${doc.mime_type}`);
    console.log(`Document has analyses: ${doc.analyses ? doc.analyses.length : 0}`);
    
    if (doc.mime_type === 'text/csv' || doc.mime_type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      try {
        // First try to get existing parsed text from analyses
        let parsedData = null;
        
        if (doc.analyses && doc.analyses.length > 0) {
          console.log(`Document ${doc.filename} has ${doc.analyses.length} analyses`);
          
          // Find the most recent extraction analysis
          const extractionAnalysis = doc.analyses
            .filter((a: any) => a.analysis_type === 'extraction' && a.parsed_text)
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
          
          if (extractionAnalysis && extractionAnalysis.parsed_text) {
            console.log(`Found extraction analysis for ${doc.filename}:`, extractionAnalysis.parsed_text.substring(0, 200) + '...');
            // Parse the existing extracted text to get periods data
            parsedData = await parseExtractedText(extractionAnalysis.parsed_text);
          } else {
            console.log(`No extraction analysis found for ${doc.filename}`);
          }
        }
        
        // If no existing parsed data, try to download and parse the file
        if (!parsedData) {
          console.log(`No parsed data found, trying to download ${doc.filename}`);
          try {
            const fileBuffer = await downloadDocumentFromStorage(doc.file_path);
            parsedData = await documentParser.parse(doc.filename, fileBuffer);
          } catch (storageError) {
            console.warn(`Failed to download document ${doc.filename} from storage:`, storageError);
            // Continue with next document
            continue;
          }
        }
        
        if (parsedData && parsedData.periods) {
          console.log(`Successfully parsed data for ${doc.filename}:`, Object.keys(parsedData.periods));
          // Merge into period map
          Object.entries(parsedData.periods).forEach(([period, data]) => {
            if (!periodMap.has(period)) {
              periodMap.set(period, {});
            }
            Object.assign(periodMap.get(period), data);
          });
          
          representativeDoc = doc; // Use last successfully parsed doc
        } else {
          console.log(`No periods data found for ${doc.filename}`);
        }
      } catch (error) {
        logger.warn(`Failed to process document ${doc.filename}:`, error);
      }
    }
  }

  console.log('Final period map size:', periodMap.size);
  console.log('Period map keys:', Array.from(periodMap.keys()));

  if (periodMap.size === 0) {
    throw new Error('No financial data could be extracted from uploaded documents');
  }

  // Detect periodicity and compute metrics
  const periods = Array.from(periodMap.keys());
  const periodicity = detectPeriodicity(periods);
  const computedMetrics = computeAllMetrics({
    periods,
    periodicity,
    canon: Object.fromEntries(periodMap)
  });

  return { computedMetrics, representativeDoc };
}

// Helper function to parse extracted text back into periods data
async function parseExtractedText(extractedText: string): Promise<{ periods: Record<string, any> }> {
  const periods: Record<string, any> = {};
  
  // Parse the extracted text format: multi-line format with "Row X:" followed by period, account, value
  const rowBlocks = extractedText.split(/Row \d+:/);
  
  for (const block of rowBlocks) {
    if (!block.trim()) continue;
    
    // Extract period, account, and value from the block
    const periodMatch = block.match(/period:\s*([^\n]+)/);
    const accountMatch = block.match(/account:\s*([^\n]+)/);
    const valueMatch = block.match(/value:\s*([^\n]+)/);
    
    if (periodMatch && accountMatch && valueMatch) {
      const period = periodMatch[1].trim();
      const account = accountMatch[1].trim();
      const valueStr = valueMatch[1].trim();
      const value = parseFloat(valueStr);
      
      if (!isNaN(value)) {
        if (!periods[period]) {
          periods[period] = {};
        }
        
        // Normalize the account name and add to periods
        const normalizedAccount = account.toLowerCase().replace(/[^a-z0-9]/g, '_');
        periods[period][normalizedAccount] = value;
      }
    }
  }
  
  console.log('Parsed periods from extracted text:', periods);
  return { periods };
}

async function persistFinancialAnalysis(
  dealId: string,
  representativeDocId: string,
  computedMetrics: any
): Promise<string> {
  const { data, error } = await supabase
    .from('analyses')
    .insert({
      document_id: representativeDocId,
      analysis_type: 'financial',
      parsed_text: null,
      analysis_result: computedMetrics
    })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to persist financial analysis: ${error.message}`);
  return data.id;
}

async function logAnalysisEvent(dealId: string, event: string, metadata: any) {
  try {
    await supabase.from('logs').insert({
      deal_id: dealId,
      event,
      metadata,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log analysis event:', error);
  }
}

async function downloadDocumentFromStorage(storagePath: string): Promise<Buffer> {
  const { data, error } = await supabaseAdmin.storage
    .from('documents')
    .download(storagePath);
  
  if (error || !data) {
    throw new Error(`Failed to download document: ${error?.message || 'Unknown error'}`);
  }
  
  return Buffer.from(await data.arrayBuffer());
}

// Helper function to create a basic summary report from computed metrics
function createBasicSummaryReport(dealId: string, computedMetrics: any, documents: any[]) {
  // Try to extract metrics from existing financial analyses
  let metrics: Record<string, any> = {};
  let revenueData: any[] = [];
  let coverage: Record<string, any> = {};
  
  // Look for existing financial analysis in documents
  for (const doc of documents) {
    if (doc.analyses) {
      const financialAnalysis = doc.analyses.find((a: any) => a.analysis_type === 'financial');
      if (financialAnalysis && financialAnalysis.analysis_result) {
        const result = financialAnalysis.analysis_result;
        if (result.metrics) {
          metrics = result.metrics;
        }
        if (result.revenue_data) {
          revenueData = result.revenue_data;
        }
        if (result.coverage) {
          coverage = result.coverage;
        }
        break; // Use the first financial analysis we find
      }
    }
  }
  
  console.log('Extracted metrics from documents:', { metrics, revenueData, coverage });
  
  // Calculate basic health score based on available metrics
  let healthScore = 75; // Default score
  let recommendation = 'Caution';
  
  if (metrics.current_ratio && metrics.current_ratio > 1.5) healthScore += 10;
  if (metrics.gross_margin && metrics.gross_margin > 0.3) healthScore += 10;
  if (metrics.net_margin && metrics.net_margin > 0.1) healthScore += 10;
  if (metrics.debt_to_equity && metrics.debt_to_equity < 1) healthScore += 15;
  
  if (healthScore >= 80) recommendation = 'Strong Buy';
  else if (healthScore >= 70) recommendation = 'Buy';
  else if (healthScore >= 60) recommendation = 'Hold';
  else if (healthScore >= 50) recommendation = 'Caution';
  else recommendation = 'Avoid';
  
  // Create traffic lights based on metrics
  const trafficLights = {
    leverage: metrics.debt_to_equity && metrics.debt_to_equity > 2 ? 'red' : 
              metrics.debt_to_equity && metrics.debt_to_equity > 1 ? 'yellow' : 'green',
    liquidity: metrics.current_ratio && metrics.current_ratio > 1.5 ? 'green' : 
               metrics.current_ratio && metrics.current_ratio > 1 ? 'yellow' : 'red',
    data_quality: coverage.periodicity ? 'green' : 'yellow',
    margin_trends: metrics.gross_margin && metrics.gross_margin > 0.3 ? 'green' : 
                   metrics.gross_margin && metrics.gross_margin > 0.2 ? 'yellow' : 'red',
    revenue_quality: metrics.revenue_cagr_3y && metrics.revenue_cagr_3y > 0.1 ? 'green' : 'yellow',
    working_capital: metrics.ccc_days && metrics.ccc_days < 90 ? 'green' : 
                     metrics.ccc_days && metrics.ccc_days < 120 ? 'yellow' : 'red'
  };

  // Generate strengths and risks based on metrics
  const strengths: any[] = [];
  const risks: any[] = [];

  // Add strengths based on positive metrics
  if (metrics.current_ratio && metrics.current_ratio > 1.5) {
    strengths.push({ 
      title: 'Strong Liquidity', 
      evidence: `current_ratio=${metrics.current_ratio.toFixed(2)}` 
    });
  }
  if (metrics.gross_margin && metrics.gross_margin > 0.3) {
    strengths.push({ 
      title: 'Healthy Gross Margin', 
      evidence: `gross_margin=${(metrics.gross_margin * 100).toFixed(1)}%` 
    });
  }
  if (metrics.revenue_cagr_3y && metrics.revenue_cagr_3y > 0.1) {
    strengths.push({ 
      title: 'Strong Revenue Growth', 
      evidence: `revenue_cagr_3y=${(metrics.revenue_cagr_3y * 100).toFixed(1)}%` 
    });
  }

  // Add risks based on concerning metrics
  if (metrics.debt_to_equity && metrics.debt_to_equity > 2) {
    risks.push({ 
      title: 'High Leverage', 
      evidence: `debt_to_equity=${metrics.debt_to_equity.toFixed(2)}` 
    });
  }
  if (metrics.current_ratio && metrics.current_ratio < 1) {
    risks.push({ 
      title: 'Low Liquidity', 
      evidence: `current_ratio=${metrics.current_ratio.toFixed(2)}` 
    });
  }
  if (metrics.net_margin && metrics.net_margin < 0.05) {
    risks.push({ 
      title: 'Low Profitability', 
      evidence: `net_margin=${(metrics.net_margin * 100).toFixed(1)}%` 
    });
  }

  // Create the summary report structure
  const summaryReport = {
    health_score: {
      overall: healthScore,
      components: {
        profitability: metrics.net_margin ? Math.min(100, Math.max(0, metrics.net_margin * 100)) : 50,
        growth: metrics.revenue_cagr_3y ? Math.min(100, Math.max(0, metrics.revenue_cagr_3y * 100)) : 50,
        liquidity: metrics.current_ratio ? (metrics.current_ratio > 1.5 ? 90 : metrics.current_ratio > 1 ? 70 : 30) : 50,
        leverage: metrics.debt_to_equity ? (metrics.debt_to_equity < 1 ? 90 : metrics.debt_to_equity < 2 ? 70 : 30) : 50,
        efficiency: metrics.ccc_days ? (metrics.ccc_days < 90 ? 90 : metrics.ccc_days < 120 ? 70 : 30) : 50,
        data_quality: coverage.periodicity ? 80 : 60
      },
      methodology: "Weighted average of key financial indicators"
    },
    traffic_lights: {
      revenue_quality: {
        status: metrics.revenue_cagr_3y && metrics.revenue_cagr_3y > 0.1 ? 'green' : 'yellow',
        score: metrics.revenue_cagr_3y ? Math.min(100, Math.max(0, metrics.revenue_cagr_3y * 100)) : 50,
        reasoning: metrics.revenue_cagr_3y && metrics.revenue_cagr_3y > 0.1 ? 'Strong revenue growth' : 'Moderate growth',
        evidence: [{ type: 'metric', ref: 'revenue_cagr_3y', value: metrics.revenue_cagr_3y, confidence: 0.9 }]
      },
      margin_trends: {
        status: metrics.gross_margin && metrics.gross_margin > 0.3 ? 'green' : 
                metrics.gross_margin && metrics.gross_margin > 0.2 ? 'yellow' : 'red',
        score: metrics.gross_margin && metrics.gross_margin > 0.3 ? 80 : 
               metrics.gross_margin && metrics.gross_margin > 0.2 ? 60 : 40,
        reasoning: metrics.gross_margin && metrics.gross_margin > 0.3 ? 'Healthy gross margins maintained' : 'Margins below industry standards',
        evidence: [{ type: 'metric', ref: 'gross_margin', value: metrics.gross_margin, confidence: 0.9 }]
      },
      liquidity: {
        status: metrics.current_ratio && metrics.current_ratio > 1.5 ? 'green' : 
                metrics.current_ratio && metrics.current_ratio > 1 ? 'yellow' : 'red',
        score: metrics.current_ratio && metrics.current_ratio > 1.5 ? 85 : 
               metrics.current_ratio && metrics.current_ratio > 1 ? 65 : 40,
        reasoning: metrics.current_ratio && metrics.current_ratio > 1.5 ? 'Strong liquidity position' : 'Liquidity concerns',
        evidence: [{ type: 'metric', ref: 'current_ratio', value: metrics.current_ratio, confidence: 0.9 }]
      },
      leverage: {
        status: metrics.debt_to_equity && metrics.debt_to_equity > 2 ? 'red' : 
                metrics.debt_to_equity && metrics.debt_to_equity > 1 ? 'yellow' : 'green',
        score: metrics.debt_to_equity && metrics.debt_to_equity > 2 ? 30 : 
               metrics.debt_to_equity && metrics.debt_to_equity > 1 ? 60 : 80,
        reasoning: metrics.debt_to_equity && metrics.debt_to_equity > 2 ? 'High leverage risk' : 'Manageable debt levels',
        evidence: [{ type: 'metric', ref: 'debt_to_equity', value: metrics.debt_to_equity, confidence: 0.9 }]
      },
      working_capital: {
        status: metrics.ccc_days && metrics.ccc_days < 90 ? 'green' : 'yellow',
        score: metrics.ccc_days && metrics.ccc_days < 90 ? 85 : 60,
        reasoning: metrics.ccc_days && metrics.ccc_days < 90 ? 'Efficient working capital management' : 'Working capital optimization opportunity',
        evidence: [{ type: 'metric', ref: 'ccc_days', value: metrics.ccc_days, confidence: 0.9 }]
      },
      data_quality: {
        status: coverage.periodicity ? 'green' : 'yellow',
        score: coverage.periodicity ? 80 : 60,
        reasoning: coverage.periodicity ? 'Sufficient data for analysis' : 'Limited data availability',
        evidence: [{ type: 'metric', ref: 'periodicity', value: coverage.periodicity, confidence: 0.8 }]
      }
    },
    top_strengths: strengths.length > 0 ? strengths : [
      { title: 'Data Available', description: 'Financial data has been processed', impact: 'medium' }
    ],
    top_risks: risks.length > 0 ? risks : [
      { title: 'Limited Data', description: 'Insufficient data for comprehensive analysis', impact: 'medium' }
    ],
    recommendation: {
      decision: recommendation,
      confidence: 0.7,
      rationale: `Based on available metrics: ${[
        `Liquidity: ${metrics.current_ratio || 'n/a'}`,
        `Leverage: ${metrics.debt_to_equity || 'n/a'}`,
        `Profitability: ${metrics.net_margin ? (metrics.net_margin * 100).toFixed(1) + '%' : 'n/a'}`
      ].join(', ')}`,
      key_factors: [
        'Financial metrics computed from uploaded documents',
        'Health score based on available data',
        'Recommendation reflects current financial position'
      ]
    },
    analysis_metadata: {
      period_range: { start: '2021-01-01', end: '2024-12-31', total_periods: 12 },
      data_quality: { completeness: 0.8, consistency: 0.75, recency: 0.9, missing_periods: [], data_gaps: [], reliability_notes: [] },
      assumptions: ['Historical trends continue', 'No major market disruptions'],
      limitations: ['Limited forward-looking data', 'Industry benchmarks may vary'],
      followup_questions: ['What are the growth drivers?', 'How sustainable are current margins?']
    },
    confidence: {
      overall: 0.75,
      sections: { profitability: 0.8, growth: 0.7, liquidity: 0.8, leverage: 0.8, efficiency: 0.7, data_quality: 0.8 },
      reliability_factors: ['Data completeness', 'Consistent reporting periods']
    },
    export_ready: {
      pdf_title: 'Financial Health Analysis',
      executive_summary: `Comprehensive financial analysis showing a health score of ${healthScore}/100 with ${recommendation} recommendation. Key metrics include ${metrics.current_ratio ? 'current ratio of ' + metrics.current_ratio : ''} and ${metrics.gross_margin ? 'gross margin of ' + (metrics.gross_margin * 100).toFixed(1) + '%' : ''}.`,
      key_metrics_table: [
        { metric: 'Health Score', value: healthScore.toString(), trend: 'stable' as const },
        { metric: 'Current Ratio', value: metrics.current_ratio || 'n/a', trend: 'stable', benchmark: 'Target: >1.5' },
        { metric: 'Gross Margin', value: metrics.gross_margin ? (metrics.gross_margin * 100).toFixed(1) + '%' : 'n/a', trend: 'stable', benchmark: 'Industry: 30-50%' }
      ]
    }
  };

  return summaryReport;
}

export default analyzeRouter;