## Scope
- Files: `documents` → extraction → metrics → summary
- Models: claude-3-5-sonnet (primary), claude-3-haiku (pre-classify)
- Privacy: no training; redact PII
- Inputs: P&L, Balance Sheet, Cash Flow (PDF/XLSX/CSV).
- Outputs:
  1) Canonical statement JSON (per document, per period).
  2) Deal-level computed metrics (15+ ratios).
  3) Risks + Executive summary with health score (0–100), traffic lights, top 5 risks/strengths, recommendation.

## Deterministic-first
- CSV/XLSX → parse deterministically → compute ratios locally.
- PDF → try machine table parse; fallback to Claude for extraction only; numbers validated locally.
- RAG only for explanations/Q&A; numbers come from deterministic pipeline.

## Two-pass AI
- Pass 1 (Extraction): map-reduce over page-aware chunks (800–1200 tokens), include page indices.
- Pass 2 (Summary): feed computed metrics + selected excerpts to Claude for risks/summary.

## JSON Schemas (canonical) (Zod in server/src/schemas/analysis.ts)
- StatementExtraction
- ComputedMetrics
- RisksSummary
- Statement extraction → see `server/src/schemas/analysis.ts` (Zod)
- Computed metrics (deal-level) → same
- Summary (risks/strengths/traffic lights) → same

## API (MVP)
- POST /files/parse/:document_id  → persist parsed_text (idempotent).
- POST /analyze (deal-level)      → aggregates latest extractions, computes ratios, generates summary.
- POST /qa                        → concatenates relevant chunks ≤200k tokens; returns answer + citations.

## Quality Controls
- Reconciliation checks, non-negative checks, period continuity.
- Confidence scores; < threshold → manual_review flag.
- Zod validation; single repair attempt on invalid JSON.

## Endpoints
- POST `/files/parse/:document_id` → persist `parsed_text`
- POST `/analyze` → aggregates extractions, computes metrics, calls Claude summary
- POST `/qa` → RAG-lite across chunks with page refs

## Prompts
- Classify → `server/src/prompts/classify.md`
- Extract (map-reduce) → `server/src/prompts/extract.md`
- Summary → `server/src/prompts/summary.md`

## Acceptance criteria
- CSV/XLSX numbers computed locally; PDFs extracted by Claude when needed.
- All LLM outputs validate against Zod; invalid → single repair attempt then fail.
- Analyses rows created:
  - `analysis_type`: 'extraction' | 'financial' | 'summary'
  - `analysis_result` matches schemas
- Latency: single PDF ≤ 2 minutes; deal-level summary ≤ 90s typical.

## Performance + Privacy
- Chunk 800–1200 tokens; cap map concurrency.
- Set “no training” flags with Anthropic.

## Non-goals (MVP)
- Full OCR, vector DB, Prisma; keep Supabase JS as-is.
