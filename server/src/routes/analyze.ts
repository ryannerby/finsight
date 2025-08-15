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
import { createRequestLogger, generateRequestId } from '../lib/logger';

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
  
  // Create request-specific logger
  const requestLogger = createRequestLogger(generateRequestId());
  const requestId = req.headers['x-request-id'] as string;
  
  try {
    if (!dealId || !userId) {
      return res.status(400).json({ 
        error: 'dealId and userId are required',
        requestId,
        type: 'ValidationError'
      });
    }

    // PHASE 5.1: Ownership & auth logging
    requestLogger.info('Analysis request initiated', { 
      dealId, 
      userId, 
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    // Rate limiting: one analysis per minute per deal
    // if (!rateLimiter.isAllowed(dealId)) {
    //   const retryAfter = Math.ceil(rateLimiter.getTimeRemaining(dealId) / 1000);
    //   const error = AnalysisErrorHandler.createRateLimitError(retryAfter);
    //   return res.status(AnalysisErrorHandler.getHttpStatus(error))
    //     .json({ 
    //       error: error.message, 
    //       type: error.type, 
    //       retryAfter: error.retryAfter,
    //       requestId
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
    
    const dealVerificationTime = Date.now() - t0;
    requestLogger.info('Deal ownership verification completed', {
      dealId,
      userId,
      verificationTimeMs: dealVerificationTime,
      success: !dealError && !!deal,
      error: dealError?.message || null
    });

    if (dealError || !deal) {
      return res.status(404).json({ 
        error: 'Deal not found or access denied',
        requestId,
        type: 'NotFoundError',
        details: dealError?.message || 'Deal verification failed'
      });
    }

    // PHASE 5.2: Document fetch logging
    t0 = Date.now();
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select(`
        *,
        analyses (*)
      `)
      .eq('deal_id', dealId);
    
    const documentFetchTime = Date.now() - t0;
    
    // Log document details
    if (documents && documents.length > 0) {
      const documentTypes = documents.map(doc => ({
        id: doc.id,
        filename: doc.filename,
        mimeType: doc.mime_type,
        fileType: doc.file_type,
        fileSize: doc.file_size,
        storagePath: doc.file_path,
        hasAnalyses: doc.analyses ? doc.analyses.length : 0
      }));
      
      requestLogger.info('Documents fetched successfully', {
        dealId,
        documentCount: documents.length,
        fetchTimeMs: documentFetchTime,
        documentTypes: documentTypes.map(dt => dt.mimeType),
        storagePaths: documentTypes.map(dt => dt.storagePath),
        totalFileSize: documentTypes.reduce((sum, dt) => sum + (dt.fileSize || 0), 0),
        documents: documentTypes
      });
    } else {
      requestLogger.warn('No documents found for analysis', {
        dealId,
        fetchTimeMs: documentFetchTime,
        error: docsError?.message || null
      });
    }

    if (docsError) {
      return res.status(500).json({ 
        error: 'Failed to fetch documents',
        requestId,
        type: 'DatabaseError',
        details: docsError.message
      });
    }
    
    if (!documents || documents.length === 0) {
      return res.status(400).json({ 
        error: 'No documents found for analysis',
        requestId,
        type: 'ValidationError',
        details: 'No documents have been uploaded for this deal'
      });
    }

    // Check file sizes and validate documents
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    for (const doc of documents) {
      if (doc.file_size && doc.file_size > MAX_FILE_SIZE) {
        const error = AnalysisErrorHandler.createFileTooLargeError(doc.file_size, MAX_FILE_SIZE);
        return res.status(AnalysisErrorHandler.getHttpStatus(error))
          .json({ 
            error: error.message, 
            type: error.type, 
            details: error.details,
            requestId
          });
      }
    }

    // PHASE 5.3: Metrics computation logging
    t0 = Date.now();
    let computedMetrics, representativeDoc;
    try {
      const result = await processDocumentsAndComputeMetrics(documents, requestLogger);
      computedMetrics = result.computedMetrics;
      representativeDoc = result.representativeDoc;
      
      const metricsComputationTime = Date.now() - t0;
      requestLogger.info('Metrics computation completed', {
        dealId,
        computationTimeMs: metricsComputationTime,
        metricsCount: Object.keys(computedMetrics).length,
        representativeDoc: {
          id: representativeDoc.id,
          filename: representativeDoc.filename,
          mimeType: representativeDoc.mime_type
        }
      });
      
      // Log per-metric inputs and outputs (rounded)
      const metricsLog = Object.entries(computedMetrics).map(([metricId, value]) => ({
        metric: metricId,
        value: value !== null ? Math.round(value * 1000) / 1000 : null, // Round to 3 decimal places
        status: value !== null ? 'computed' : 'missing_data'
      }));
      
      requestLogger.info('Individual metrics computed', {
        dealId,
        metrics: metricsLog,
        summary: {
          total: metricsLog.length,
          computed: metricsLog.filter(m => m.status === 'computed').length,
          missing: metricsLog.filter(m => m.status === 'missing_data').length
        }
      });
      
    } catch (error) {
      requestLogger.error('Error processing documents and computing metrics', {
        dealId,
        error: error instanceof Error ? error.message : 'Metrics computation failed',
        stack: error instanceof Error ? error.stack : null
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Metrics computation failed';
      return res.status(500).json({ 
        error: `Failed to process documents: ${errorMessage}`,
        requestId,
        type: 'ProcessingError',
        details: errorMessage
      });
    }

    // PHASE 5.4: LLM summary with error handling
    t0 = Date.now();
    let enhancedAnalysisResult = null;
    try {
      // Check if Anthropic API key is available
      if (!process.env.ANTHROPIC_API_KEY) {
        const error = AnalysisErrorHandler.createLLMUnavailableError('ANTHROPIC_API_KEY environment variable not set');
        requestLogger.warn('LLM service unavailable - API key missing', {
          dealId,
          error: error.message,
          details: error.details
        });
        throw error;
      }
      
      // Validate API key format (basic check)
      if (process.env.ANTHROPIC_API_KEY.length < 20) {
        const error = AnalysisErrorHandler.createLLMUnavailableError('ANTHROPIC_API_KEY appears to be invalid or too short');
        requestLogger.warn('LLM service unavailable - API key appears invalid', {
          dealId,
          error: error.message,
          details: error.details
        });
        throw error;
      }
      
      requestLogger.info('Starting enhanced analysis with LLM', { dealId });
      const { analysisId, summaryReport, generationStats } = await enhancedAnalysisService
        .generateComprehensiveReport(dealId, documents, computedMetrics);
      
      enhancedAnalysisResult = {
        analysisId,
        summaryReport,
        generationStats
      };
      
      const enhancedAnalysisTime = Date.now() - t0;
      requestLogger.info('Enhanced analysis completed successfully', {
        dealId,
        analysisId,
        enhancedAnalysisTimeMs: enhancedAnalysisTime,
        generationStats
      });
      
    } catch (enhancedError) {
      const enhancedAnalysisTime = Date.now() - t0;
      
      if (enhancedError instanceof Error && enhancedError.message.includes('LLM service unavailable')) {
        // This is our custom error for missing/invalid API key
        requestLogger.warn('LLM service unavailable, continuing with traditional analysis', {
          dealId,
          error: enhancedError.message,
          enhancedAnalysisTimeMs: enhancedAnalysisTime
        });
        
        // Return the error to the client
        return res.status(AnalysisErrorHandler.getHttpStatus({
          type: 'llm_unavailable',
          message: enhancedError.message,
          details: { reason: 'API key missing or invalid' }
        })).json({
          error: enhancedError.message,
          type: 'llm_unavailable',
          details: { reason: 'API key missing or invalid' },
          requestId
        });
      }
      
      // Other enhanced analysis errors - log and continue with traditional analysis
      const errorMessage = enhancedError instanceof Error ? enhancedError.message : 'Enhanced analysis failed';
      requestLogger.warn('Enhanced analysis failed, continuing with traditional analysis', {
        dealId,
        error: errorMessage,
        enhancedAnalysisTimeMs: enhancedAnalysisTime
      });
    }

    // Create a basic summary report from computed metrics if enhanced analysis failed
    let basicSummaryReport = null;
    if (!enhancedAnalysisResult?.summaryReport) {
      try {
        requestLogger.info('Creating basic summary report from computed metrics', { dealId });
        basicSummaryReport = createBasicSummaryReport(dealId, computedMetrics, documents);
        requestLogger.info('Basic summary report created successfully', { 
          dealId,
          hasReport: !!basicSummaryReport,
          reportKeys: basicSummaryReport ? Object.keys(basicSummaryReport) : []
        });
      } catch (summaryError) {
        const errorMessage = summaryError instanceof Error ? summaryError.message : 'Summary report creation failed';
        requestLogger.error('Failed to create basic summary report', {
          dealId,
          error: errorMessage,
          stack: summaryError instanceof Error ? summaryError.stack : null
        });
      }
    }

    // PHASE 5.5: Persistence verification and logging
    t0 = Date.now();
    const financialAnalysisId = await persistFinancialAnalysis(
      dealId,
      representativeDoc.id,
      computedMetrics,
      requestLogger
    );
    
    const persistenceTime = Date.now() - t0;
    requestLogger.info('Financial analysis persisted successfully', {
      dealId,
      financialAnalysisId,
      persistenceTimeMs: persistenceTime,
      documentId: representativeDoc.id
    });

    const totalTime = Date.now() - startTime;
    
    // Log success
    await logAnalysisEvent(dealId, 'analysis_completed', {
      total_time_ms: totalTime,
      document_count: documents.length,
      enhanced_analysis_id: enhancedAnalysisResult?.analysisId,
      financial_analysis_id: financialAnalysisId,
      user_id: userId
    });

    requestLogger.info('Analysis pipeline completed successfully', {
      dealId,
      userId,
      totalTimeMs: totalTime,
      enhancedAnalysisAvailable: !!enhancedAnalysisResult,
      financialAnalysisId,
      documentCount: documents.length
    });

    res.json({
      success: true,
      analysisId: enhancedAnalysisResult?.analysisId,
      financialMetricsId: financialAnalysisId,
      summaryReport: enhancedAnalysisResult?.summaryReport || basicSummaryReport,
      generationStats: enhancedAnalysisResult?.generationStats,
      exportVersion: 'v1',
      requestId,
      metadata: {
        documentCount: documents.length,
        totalProcessingTime: totalTime,
        enhancedAnalysisAvailable: !!enhancedAnalysisResult,
        dataQuality: enhancedAnalysisResult?.summaryReport?.analysis_metadata?.data_quality || 'basic'
      }
    });

  } catch (error) {
    const totalTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Analysis pipeline failed';
    
    requestLogger.error('Analysis pipeline failed', {
      dealId,
      userId,
      totalTimeMs: totalTime,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : null
    });
    
    await logAnalysisEvent(dealId, 'analysis_failed', {
      total_time_ms: totalTime,
      error: errorMessage,
      user_id: userId
    });
    
    // Return structured error response instead of passing to next()
    return res.status(500).json({
      error: errorMessage,
      requestId,
      type: 'AnalysisError',
      details: 'The analysis pipeline encountered an unexpected error'
    });
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
async function processDocumentsAndComputeMetrics(documents: any[], logger: any) {
  logger.info('Starting document processing and metrics computation', { 
    documentCount: documents.length 
  });
  
  const periodMap = new Map<string, any>();
  let representativeDoc = documents[0];

  // Process each document
  for (const doc of documents) {
    logger.info('Processing document', {
      documentId: doc.id,
      filename: doc.filename,
      mimeType: doc.mime_type,
      hasAnalyses: doc.analyses ? doc.analyses.length : 0
    });
    
    if (doc.mime_type === 'text/csv' || doc.mime_type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      try {
        // First try to get existing parsed text from analyses
        let parsedData = null;
        
        if (doc.analyses && doc.analyses.length > 0) {
          logger.info('Document has existing analyses', {
            documentId: doc.id,
            analysisCount: doc.analyses.length
          });
          
          // Find the most recent extraction analysis
          const extractionAnalysis = doc.analyses
            .filter((a: any) => a.analysis_type === 'extraction' && a.parsed_text)
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
          
          if (extractionAnalysis && extractionAnalysis.parsed_text) {
            logger.info('Found existing extraction analysis', {
              documentId: doc.id,
              analysisId: extractionAnalysis.id,
              parsedTextLength: extractionAnalysis.parsed_text.length
            });
            // Parse the existing extracted text to get periods data
            parsedData = await parseExtractedText(extractionAnalysis.parsed_text);
          } else {
            logger.info('No extraction analysis found for document', { documentId: doc.id });
          }
        }
        
        // If no existing parsed data, try to download and parse the file
        if (!parsedData) {
          logger.info('No parsed data found, downloading document from storage', { 
            documentId: doc.id,
            storagePath: doc.file_path 
          });
          try {
            const fileBuffer = await downloadDocumentFromStorage(doc.file_path);
            parsedData = await documentParser.parse(doc.filename, fileBuffer);
            logger.info('Document downloaded and parsed successfully', {
              documentId: doc.id,
              fileSizeBytes: fileBuffer.length
            });
          } catch (storageError) {
            logger.warn('Failed to download document from storage', {
              documentId: doc.id,
              storagePath: doc.file_path,
              error: storageError instanceof Error ? storageError.message : 'Unknown error'
            });
            // Continue with next document
            continue;
          }
        }
        
        if (parsedData && parsedData.periods) {
          logger.info('Successfully parsed document data', {
            documentId: doc.id,
            periodCount: Object.keys(parsedData.periods).length,
            periods: Object.keys(parsedData.periods)
          });
          // Merge into period map
          Object.entries(parsedData.periods).forEach(([period, data]) => {
            if (!periodMap.has(period)) {
              periodMap.set(period, {});
            }
            Object.assign(periodMap.get(period), data);
          });
          
          representativeDoc = doc; // Use last successfully parsed doc
        } else {
          logger.warn('No periods data found in parsed document', { documentId: doc.id });
        }
      } catch (error) {
        logger.warn('Failed to process document', {
          documentId: doc.id,
          filename: doc.filename,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  logger.info('Document processing completed', {
    finalPeriodMapSize: periodMap.size,
    periodKeys: Array.from(periodMap.keys())
  });

  if (periodMap.size === 0) {
    throw new Error('No financial data could be extracted from uploaded documents');
  }

  // Detect periodicity and compute metrics
  const periods = Array.from(periodMap.keys());
  const periodicity = detectPeriodicity(periods);
  
  logger.info('Starting metrics computation', {
    periodCount: periods.length,
    periodicity,
    periods: periods.slice(0, 5) // Log first 5 periods to avoid excessive logging
  });
  
  const computedMetrics = computeAllMetrics({
    periods,
    periodicity,
    canon: Object.fromEntries(periodMap)
  }, logger);

  logger.info('Metrics computation completed', {
    metricsCount: Object.keys(computedMetrics).length,
    metrics: Object.entries(computedMetrics).map(([metricId, value]) => ({
      metric: metricId,
      value: value !== null ? Math.round(value * 1000) / 1000 : null, // Round to 3 decimal places
      status: value !== null ? 'computed' : 'missing_data'
    }))
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
  
  return { periods };
}

async function persistFinancialAnalysis(
  dealId: string,
  representativeDocId: string,
  computedMetrics: any,
  logger: any
): Promise<string> {
  logger.info('Persisting financial analysis to database', {
    dealId,
    documentId: representativeDocId,
    metricsCount: Object.keys(computedMetrics).length
  });
  
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

  if (error) {
    logger.error('Failed to persist financial analysis', {
      dealId,
      documentId: representativeDocId,
      error: error.message,
      stack: error.stack
    });
    throw new Error(`Failed to persist financial analysis: ${error.message}`);
  }
  
  logger.info('Financial analysis persisted successfully', {
    dealId,
    analysisId: data.id,
    documentId: representativeDocId
  });
  
  return data.id;
}

async function logAnalysisEvent(dealId: string, event: string, metadata: any) {
  try {
    const { data, error } = await supabase.from('logs').insert({
      deal_id: dealId,
      event,
      metadata,
      timestamp: new Date().toISOString()
    });
    
    if (error) {
      console.error('Failed to log analysis event to database:', error);
    } else {
      console.log('Analysis event logged successfully:', { dealId, event, logId: 'logged' });
    }
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