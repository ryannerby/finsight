## Guardrails
- Do not change DB schema or auth.
- Use only `server/src/schemas/analysis.ts` for JSON contracts.
- Add new files under `server/src/services`, `server/src/prompts`, `server/src/schemas`.

## Steps to execute
1) Implement Zod schemas (`server/src/schemas/analysis.ts`) and export TS types.
2) Add Anthropic client (`server/src/services/anthropic.ts`) reading `ANTHROPIC_API_KEY`.
3) Extend `/files/parse/:document_id` to insert into `analyses` (parsed_text).
4) Implement `/analyze`: gather docs → ensure extraction → compute metrics → call summary → save.
5) Store prompts in `server/src/prompts/*.md`; load as strings.

## Done means
- `pnpm -F server build` succeeds.
- Zod validations pass for mock responses.
- Manual run: upload CSV/PDF → parse → analyze → see summary JSON via API.