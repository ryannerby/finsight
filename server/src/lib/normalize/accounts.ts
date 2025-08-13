export type Canon = {
  // Income Statement
  revenue?: number; cogs?: number; gross_profit?: number;
  sga?: number; operating_expenses?: number; net_income?: number;
  ebitda?: number;
  interest_expense?: number;
  // Balance Sheet
  cash?: number; marketable_securities?: number;
  accounts_receivable?: number; inventory?: number;
  other_current_assets?: number; current_assets?: number;
  accounts_payable?: number; short_term_debt?: number;
  other_current_liabilities?: number; current_liabilities?: number;
  total_debt?: number; shareholders_equity?: number;
  total_assets?: number; total_liabilities?: number;
  // Cash Flow
  cfo?: number; cfi?: number; cff?: number; net_change_in_cash?: number;
};

const ALIASES: Record<string, keyof Canon> = {
  "sales": "revenue",
  "total revenue": "revenue",
  "revenue": "revenue",
  "cost of goods sold": "cogs",
  "cogs": "cogs",
  "gross profit": "gross_profit",
  "selling general administrative": "sga",
  "sga": "sga",
  "operating expenses": "operating_expenses",
  "net income": "net_income",
  "ebitda": "ebitda",
  "interest expense": "interest_expense",

  "cash and cash equivalents": "cash",
  "cash": "cash",
  "marketable securities": "marketable_securities",
  "accounts receivable": "accounts_receivable",
  "trade receivables": "accounts_receivable",
  "inventory": "inventory",
  "other current assets": "other_current_assets",
  "total current assets": "current_assets",

  "accounts payable": "accounts_payable",
  "short-term debt": "short_term_debt",
  "other current liabilities": "other_current_liabilities",
  "total current liabilities": "current_liabilities",

  "total liabilities": "total_liabilities",
  "shareholders' equity": "shareholders_equity",
  "total shareholders' equity": "shareholders_equity",
  "total assets": "total_assets",

  "total debt": "total_debt",

  "net cash from operating activities": "cfo",
  "net cash used in investing activities": "cfi",
  "net cash from financing activities": "cff",
  "net change in cash": "net_change_in_cash",
};

export function normalizeLines(rawLines: {account: string; value: number}[]): Partial<Canon> {
  const out: Partial<Canon> = {};
  for (const {account, value} of rawLines) {
    const key = ALIASES[account.trim().toLowerCase()];
    if (key) out[key] = value;
  }
  if (out.revenue != null && out.cogs != null && out.gross_profit == null) {
    out.gross_profit = out.revenue - out.cogs;
  }
  if (out.total_debt == null) {
    const debt = (out.short_term_debt ?? 0);
    out.total_debt = debt || undefined;
  }
  return out;
}