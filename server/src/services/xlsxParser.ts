import * as XLSX from 'xlsx';

export type ParsedRow = { period: string; account: string; value: number };

// Deterministic parser for simple accounting spreadsheets.
// Accepts first sheet; expects columns like period/account/value (case-insensitive, spaces tolerated)
export function parseXlsxToRows(buffer: Buffer): ParsedRow[] {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return [];
  const ws = wb.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json<any>(ws, { raw: true, defval: null });
  const rows: ParsedRow[] = [];
  for (const r of json) {
    const period = String(r.period ?? r.Period ?? r.PERIOD ?? '').trim();
    const account = String(r.account ?? r.Account ?? r.ACCOUNT ?? '').trim();
    const valueRaw = r.value ?? r.Value ?? r.VALUE ?? null;
    const value = typeof valueRaw === 'number' ? valueRaw : Number(valueRaw);
    if (!period || !account || Number.isNaN(value)) continue;
    rows.push({ period, account, value });
  }
  return rows;
}


