import { Router, Request, Response } from 'express';
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
import { withTimeout, TIMEOUTS } from '../services/timeoutWrapper';

export const analyzeRouter = Router();

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
analyzeRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { dealId, userId } = req.body;
    if (!dealId || !userId) return res.status(400).json({ error: 'dealId and userId are required' });

    // Rate limiting: one analysis per minute per deal
    if (!rateLimiter.isAllowed(dealId)) {
      const retryAfter = Math.ceil(rateLimiter.getTimeRemaining(dealId) / 1000);
      const error = AnalysisErrorHandler.createRateLimitError(retryAfter);
      return res.status(AnalysisErrorHandler.getHttpStatus(error))
        .json({ 
          error: error.message, 
          type: error.type, 
          retryAfter: error.retryAfter 
        });
    }

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
      .select('*')
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

    // Build a consolidated canon from CSVs (PDF/XLSX can be added next)
    const mergedCanon: CanonByPeriod = {};
    for (const doc of documents) {
      if (!doc.mime_type) continue;
      
      try {
        if (doc.mime_type.startsWith('text/csv') || doc.mime_type === 'application/csv') {
          t0 = Date.now();
          const fileProcessingPromise = (async () => {
            const { data: fileData, error: dlErr } = await supabaseAdmin.storage.from('documents').download(doc.file_path);
            if (dlErr || !fileData) throw new Error('Failed to download CSV file');
            const csvText = await fileData.text();
            const { canon } = canonFromCsv(csvText);
            return canon;
          })();

          const canon = await withTimeout(fileProcessingPromise, TIMEOUTS.FILE_PROCESSING, 'CSV processing');
          console.log(`[analyze] download_csv ${Date.now() - t0}ms ok`);
          
          for (const [period, values] of Object.entries(canon)) {
            mergedCanon[period] = { ...(mergedCanon[period] || {}), ...values };
          }
        } else if (
          doc.mime_type.includes('spreadsheet') ||
          doc.mime_type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          doc.mime_type === 'application/vnd.ms-excel'
        ) {
          t0 = Date.now();
          const fileProcessingPromise = (async () => {
            const { data: fileData, error: dlErr } = await supabaseAdmin.storage.from('documents').download(doc.file_path);
            if (dlErr || !fileData) throw new Error('Failed to download Excel file');
            const buf = Buffer.from(await fileData.arrayBuffer());
            const rows = parseXlsxToRows(buf);
            const canon: CanonByPeriod = {} as any;
            for (const r of rows) {
              if (!canon[r.period]) canon[r.period] = {};
              const norm = normalizeLines([{ account: r.account, value: r.value }]);
              Object.assign(canon[r.period], norm);
            }
            return canon;
          })();

          const canon = await withTimeout(fileProcessingPromise, TIMEOUTS.FILE_PROCESSING, 'Excel processing');
          console.log(`[analyze] download_xlsx ${Date.now() - t0}ms ok`);
          
          for (const [period, values] of Object.entries(canon)) {
            mergedCanon[period] = { ...(mergedCanon[period] || {}), ...values };
          }
        }
        // TODO: add PDF (LLM extraction) → canon
      } catch (error) {
        console.error(`Error processing document ${doc.id}:`, error);
        // Continue with other documents instead of failing completely
        continue;
      }
    }

    const periods = Object.keys(mergedCanon);
    if (periods.length === 0) {
      return res.status(400).json({ error: 'No structured data found (upload CSV/XLSX or enable PDF extraction)' });
    }
    const periodicity = detectPeriodicity(periods);
    
    // Compute metrics with timeout
    t0 = Date.now();
    let metrics;
    try {
      const metricsPromise = Promise.resolve(computeAllMetrics({ periods, periodicity, canon: mergedCanon }));
      metrics = await withTimeout(metricsPromise, TIMEOUTS.METRICS_COMPUTATION, 'metrics computation');
      console.log(`[analyze] compute_metrics ${Date.now() - t0}ms ok`);
    } catch (error) {
      console.error('Error computing metrics:', error);
      const analysisError = error instanceof Error && error.message.includes('Timeout') 
        ? AnalysisErrorHandler.createTimeoutError('metrics computation')
        : AnalysisErrorHandler.createInvalidDataError('metrics computation', { periods, periodicity });
      
      return res.status(AnalysisErrorHandler.getHttpStatus(analysisError))
        .json({ 
          error: analysisError.message, 
          type: analysisError.type, 
          details: analysisError.details 
        });
    }

    // Save financial analysis row, anchored to a representative document
    const representativeDocId = documents[0].id;

    // Extract revenue data for charting
    const revenueData: { year: string; revenue: number }[] = [];
    for (const period of periods) {
      const revenue = mergedCanon[period]?.revenue;
      if (typeof revenue === 'number' && revenue > 0) {
        revenueData.push({
          year: period,
          revenue: revenue
        });
      }
    }

    const dealMetrics = {
      deal_id: dealId,
      metrics,
      coverage: { periodicity },
      revenue_data: revenueData
    };

    t0 = Date.now();
    const { data: financialRow, error: insErr } = await supabase
      .from('analyses')
      .insert({
        document_id: representativeDocId,
        analysis_type: 'financial',
        parsed_text: null,
        analysis_result: dealMetrics
      })
      .select()
      .single();
    console.log(`[analyze] save_financial ${Date.now() - t0}ms ${insErr ? 'fail' : 'ok'}`);

    if (insErr) return res.status(500).json({ error: 'Failed to save financial analysis' });

    // Build Document Inventory (based on what we parsed)
    const byType: any = {};
    // Very naive mapping: if we see net_income/gross_profit assume income_statement; cash/accounts_receivable -> balance_sheet; cfo -> cash_flow
    if (periods.some(p=> mergedCanon[p]?.revenue != null || mergedCanon[p]?.gross_profit != null || mergedCanon[p]?.net_income != null)) {
      byType['income_statement'] = { canon: mergedCanon, periods };
    }
    if (periods.some(p=> mergedCanon[p]?.current_assets != null || mergedCanon[p]?.current_liabilities != null || mergedCanon[p]?.total_assets != null)) {
      byType['balance_sheet'] = { canon: mergedCanon, periods };
    }
    if (periods.some(p=> mergedCanon[p]?.cfo != null || mergedCanon[p]?.net_change_in_cash != null)) {
      byType['cash_flow'] = { canon: mergedCanon, periods };
    }

    let inv = buildDocumentInventory({ dealId, canonByDocType: byType });
    try { inv = DocumentInventory.parse(inv); } catch {}

    t0 = Date.now();
    await supabase
      .from('analyses')
      .insert({
        document_id: representativeDocId,
        analysis_type: 'doc_inventory',
        parsed_text: null,
        analysis_result: inv
      });
    console.log(`[analyze] save_doc_inventory ${Date.now() - t0}ms ok`);

    // If enabled, compute DD signals
    if (process.env.DD_RULES_ENABLED === 'true') {
      let sig = computeDDSignals({ dealId, periods, canon: mergedCanon });
      try { sig = DDSignals.parse(sig); } catch {}
      t0 = Date.now();
      await supabase
        .from('analyses')
        .insert({
          document_id: representativeDocId,
          analysis_type: 'dd_signals',
          parsed_text: null,
          analysis_result: sig
        });
      console.log(`[analyze] save_dd_signals ${Date.now() - t0}ms ok`);
    }

    // Generate summary using Anthropic
    // Load summary prompt from file (works in dev and after build)
    const promptPaths = [
      path.resolve(__dirname, '../prompts/summary.md'),          // tsx dev: src/routes -> src/prompts
      path.resolve(__dirname, '../../src/prompts/summary.md'),   // built: dist/routes -> src/prompts
      path.resolve(process.cwd(), 'server/src/prompts/summary.md')
    ];
    let summarySystem = 'You write crisp risk/strength summaries with citations.';
    let summaryUser = '';
    for (const p of promptPaths) {
      try {
        if (fs.existsSync(p)) {
          const fileText = fs.readFileSync(p, 'utf8');
          // First line is the system directive in our prompt file
          const lines = fileText.split(/\r?\n/);
          if (lines[0]?.startsWith('System:')) {
            summarySystem = lines[0].replace(/^System:\s*/, '').trim();
            summaryUser = lines.slice(1).join('\n');
          } else {
            summaryUser = fileText;
          }
          break;
        }
      } catch {}
    }

    const excerpts: Array<{ page: number; text: string }> = []; // placeholder for now
    const userPayload = `${summaryUser}\n\nReturn ONLY strict JSON matching this shape (no prose):\n{\n  "health_score": <0-100 number>,\n  "traffic_lights": { "revenue_quality": "green|yellow|red", ... },\n  "top_strengths": [{ "title": string, "evidence": string, "page": number? }],\n  "top_risks": [{ "title": string, "evidence": string, "page": number? }],\n  "recommendation": "Proceed|Caution|Pass"\n}\n\nComputedMetrics (source of truth, use these numbers):\n${JSON.stringify(dealMetrics.metrics, null, 2)}\n\nEXCERPTS (optional citations):\n${JSON.stringify(excerpts)}`;

    // Generate summary using Anthropic with timeout and error handling
    t0 = Date.now();
    let llmResp;
    try {
      const aiPromise = jsonCall({ system: summarySystem, prompt: userPayload });
      llmResp = await withTimeout(aiPromise, TIMEOUTS.AI_SUMMARY, 'AI summary generation');
      console.log(`[analyze] anthropic_summary ${Date.now() - t0}ms ok`);
    } catch (error) {
      console.error('Error calling AI for summary:', error);
      const analysisError = error instanceof Error && error.message.includes('Timeout')
        ? AnalysisErrorHandler.createTimeoutError('AI summary generation')
        : AnalysisErrorHandler.createAIError(error);
      
      return res.status(AnalysisErrorHandler.getHttpStatus(analysisError))
        .json({ 
          error: analysisError.message, 
          type: analysisError.type, 
          details: analysisError.details 
        });
    }

    // Extract text content from Anthropic response
    let textOut = '';
    const blocks: any[] = Array.isArray((llmResp as any)?.content) ? (llmResp as any).content : [];
    for (const b of blocks) {
      if (b && typeof b === 'object' && b.type === 'text' && typeof b.text === 'string') {
        textOut += (textOut ? '\n' : '') + b.text;
      }
    }

    // Try parse JSON from text blocks
    let parsed: any = undefined;
    if (textOut) {
      try { parsed = JSON.parse(textOut); } catch {}
    }
    if (!parsed && textOut) {
      // Final fence cleanup attempt
      const fenced = textOut.trim().replace(/^```json\s*|```$/g, '').trim();
      try { parsed = JSON.parse(fenced); } catch {}
    }
    if (!parsed) {
      const error = AnalysisErrorHandler.createAIError(new Error('Failed to parse summary JSON from model'));
      return res.status(AnalysisErrorHandler.getHttpStatus(error))
        .json({ 
          error: error.message, 
          type: error.type, 
          details: error.details 
        });
    }

    // Validate with Zod
    let validSummary;
    try {
      validSummary = Summary.parse({ deal_id: dealId, ...parsed });
    } catch (e) {
      const error = AnalysisErrorHandler.createInvalidDataError('summary validation', { 
        validationErrors: (e as any)?.errors ?? String(e),
        parsedData: parsed 
      });
      return res.status(AnalysisErrorHandler.getHttpStatus(error))
        .json({ 
          error: error.message, 
          type: error.type, 
          details: error.details 
        });
    }

    const { data: summaryRow, error: sumErr } = await supabase
      .from('analyses')
      .insert({
        document_id: representativeDocId,
        analysis_type: 'summary',
        parsed_text: null,
        analysis_result: validSummary
      })
      .select()
      .single();

    if (sumErr) return res.status(500).json({ error: 'Failed to save summary analysis' });

    // Optional DD Checklist generation (LLM) — additive
    if (process.env.DD_CHECKLIST_ENABLED === 'true') {
      // Load checklist prompt
      const ddPaths = [
        path.resolve(__dirname, '../prompts/dd_checklist.md'),
        path.resolve(__dirname, '../../src/prompts/dd_checklist.md'),
        path.resolve(process.cwd(), 'server/src/prompts/dd_checklist.md')
      ];
      let ddSystem = 'You output strict JSON for due diligence checklists.';
      let ddUser = '';
      for (const p of ddPaths) {
        try {
          if (fs.existsSync(p)) {
            const fileText = fs.readFileSync(p, 'utf8');
            const lines = fileText.split(/\r?\n/);
            if (lines[0]?.startsWith('System:')) {
              ddSystem = lines[0].replace(/^System:\s*/, '').trim();
              ddUser = lines.slice(1).join('\n');
            } else {
              ddUser = fileText;
            }
            break;
          }
        } catch {}
      }

      const ddPayload = `${ddUser}\n\nReturn ONLY strict JSON matching this shape (no prose):\n{\n  "items": [ { "id": string, "label": string, "status": "todo"|"in_progress"|"done"|"na", "notes": string? } ]\n}\n\nComputedMetrics (source of truth):\n${JSON.stringify(dealMetrics.metrics, null, 2)}\n\nDocumentInventory:\n${JSON.stringify(inv, null, 2)}`;

      async function callChecklist(payload: string) {
        try {
          const aiPromise = jsonCall({ system: ddSystem, prompt: payload });
          const resp = await withTimeout(aiPromise, TIMEOUTS.AI_CHECKLIST, 'AI checklist generation');
          
          let textOut = '';
          const blocks: any[] = Array.isArray((resp as any)?.content) ? (resp as any).content : [];
          for (const b of blocks) {
            if (b && typeof b === 'object' && b.type === 'text' && typeof b.text === 'string') {
              textOut += (textOut ? '\n' : '') + b.text;
            }
          }
          let parsed: any = undefined;
          if (textOut) { try { parsed = JSON.parse(textOut); } catch {} }
          if (!parsed && textOut) {
            const fenced = textOut.trim().replace(/^```json\s*|```$/g, '').trim();
            try { parsed = JSON.parse(fenced); } catch {}
          }
          return parsed;
        } catch (error) {
          console.error('Error calling AI for checklist:', error);
          // Don't fail the entire analysis if checklist fails
          return null;
        }
      }

      let ddParsed = await callChecklist(ddPayload);
      let ddValid: any = null;
      if (ddParsed) {
        try { ddValid = DueDiligenceChecklist.parse({ deal_id: dealId, ...ddParsed }); } catch {}
      }
      if (!ddValid) {
        // single repair attempt: append guidance
        const repair = `${ddPayload}\n\nIf your previous output did not validate, fix keys/types and re-output strict JSON again.`;
        ddParsed = await callChecklist(repair);
        if (ddParsed) {
          try { ddValid = DueDiligenceChecklist.parse({ deal_id: dealId, ...ddParsed }); } catch {}
        }
      }

      if (ddValid) {
        await supabase
          .from('analyses')
          .insert({
            document_id: representativeDocId,
            analysis_type: 'dd_checklist',
            parsed_text: null,
            analysis_result: ddValid
          });
      }
    }

    return res.json({ financial: financialRow, summary: summaryRow });
  } catch (error) {
    console.error('Error in analyze:', error);
    const analysisError = AnalysisErrorHandler.createUnknownError(error);
    res.status(AnalysisErrorHandler.getHttpStatus(analysisError))
      .json({ 
        error: analysisError.message, 
        type: analysisError.type, 
        details: analysisError.details 
      });
  }
});

export default analyzeRouter;