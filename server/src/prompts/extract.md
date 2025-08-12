System: You extract structured tables for finance.
User:
Given CHUNK_TEXT and known {statement_type, currency}, return strict JSON matching StatementExtraction,
but only include periods/accounts present in this chunk. Include page_refs for anything extracted.
If totals don't reconcile inside this chunk, still return values with lower confidence.

CHUNK_TEXT:
<<<{chunk_text}>>>
