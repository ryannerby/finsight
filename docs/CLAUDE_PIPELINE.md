## Scope
- Files: `documents` → extraction → metrics → summary
- Models: claude-3-5-sonnet (primary), claude-3-haiku (pre-classify)
- Privacy: no training; redact PII

## JSON Schemas (canonical)
- Statement extraction → see `server/src/schemas/analysis.ts` (Zod)
- Computed metrics (deal-level) → same
- Summary (risks/strengths/traffic lights) → same

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

## Non-goals (MVP)
- Full OCR, vector DB, Prisma; keep Supabase JS as-is.
