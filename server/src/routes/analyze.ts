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

    // Verify the deal belongs to the user
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('id,user_id')
      .eq('id', dealId)
      .eq('user_id', userId)
      .single();

    if (dealError || !deal) return res.status(404).json({ error: 'Deal not found or access denied' });

    // Get documents for this deal
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .eq('deal_id', dealId);

    if (docsError) return res.status(500).json({ error: 'Failed to fetch documents' });
    if (!documents || documents.length === 0) return res.status(400).json({ error: 'No documents found for analysis' });

    // Build a consolidated canon from CSVs (PDF/XLSX can be added next)
    const mergedCanon: CanonByPeriod = {};
    for (const doc of documents) {
      if (!doc.mime_type) continue;
      if (doc.mime_type.startsWith('text/csv') || doc.mime_type === 'application/csv') {
        const { data: fileData, error: dlErr } = await supabaseAdmin.storage.from('documents').download(doc.file_path);
        if (dlErr || !fileData) continue;
        const csvText = await fileData.text();
        const { canon } = canonFromCsv(csvText);
        for (const [period, values] of Object.entries(canon)) {
          mergedCanon[period] = { ...(mergedCanon[period] || {}), ...values };
        }
      } else if (
        doc.mime_type.includes('spreadsheet') ||
        doc.mime_type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        doc.mime_type === 'application/vnd.ms-excel'
      ) {
        const { data: fileData, error: dlErr } = await supabaseAdmin.storage.from('documents').download(doc.file_path);
        if (dlErr || !fileData) continue;
        const buf = Buffer.from(await fileData.arrayBuffer());
        const rows = parseXlsxToRows(buf);
        const canon: CanonByPeriod = {} as any;
        for (const r of rows) {
          if (!canon[r.period]) canon[r.period] = {};
          const norm = normalizeLines([{ account: r.account, value: r.value }]);
          Object.assign(canon[r.period], norm);
        }
        for (const [period, values] of Object.entries(canon)) {
          mergedCanon[period] = { ...(mergedCanon[period] || {}), ...values };
        }
      }
      // TODO: add PDF (LLM extraction) → canon
    }

    const periods = Object.keys(mergedCanon);
    if (periods.length === 0) {
      return res.status(400).json({ error: 'No structured data found (upload CSV/XLSX or enable PDF extraction)' });
    }
    const periodicity = detectPeriodicity(periods);
    const metrics = computeAllMetrics({ periods, periodicity, canon: mergedCanon });

    // Save financial analysis row, anchored to a representative document
    const representativeDocId = documents[0].id;

    const dealMetrics = {
      deal_id: dealId,
      metrics,
      coverage: { periodicity }
    };

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

    await supabase
      .from('analyses')
      .insert({
        document_id: representativeDocId,
        analysis_type: 'doc_inventory',
        parsed_text: null,
        analysis_result: inv
      });

    // If enabled, compute DD signals
    if (process.env.DD_RULES_ENABLED === 'true') {
      let sig = computeDDSignals({ dealId, periods, canon: mergedCanon });
      try { sig = DDSignals.parse(sig); } catch {}
      await supabase
        .from('analyses')
        .insert({
          document_id: representativeDocId,
          analysis_type: 'dd_signals',
          parsed_text: null,
          analysis_result: sig
        });
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

    const llmResp = await jsonCall({ system: summarySystem, prompt: userPayload });
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
      return res.status(500).json({ error: 'Failed to parse summary JSON from model' });
    }

    // Validate with Zod
    let validSummary;
    try {
      validSummary = Summary.parse({ deal_id: dealId, ...parsed });
    } catch (e) {
      return res.status(500).json({ error: 'Summary validation failed', details: (e as any)?.errors ?? String(e) });
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
        const resp = await jsonCall({ system: ddSystem, prompt: payload });
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default analyzeRouter;