import type { PeriodKey, Periodicity, CanonByPeriod } from "../lib/math/ratios";
import type { TDocumentInventory } from "../schemas/analysis";

export type StatementKind = 'income_statement'|'balance_sheet'|'cash_flow';

export function buildDocumentInventory(input: {
  dealId: string;
  canonByDocType: Partial<Record<StatementKind, { canon: CanonByPeriod; periods: PeriodKey[] }>>;
  periodicityByType?: Partial<Record<StatementKind, Periodicity>>;
}): TDocumentInventory {
  const expected: StatementKind[] = ['income_statement','balance_sheet','cash_flow'];
  const present: StatementKind[] = expected.filter(k => !!input.canonByDocType[k]);
  const missing: StatementKind[] = expected.filter(k => !present.includes(k));

  const coverage: TDocumentInventory['coverage'] = {} as any;
  for (const k of expected) {
    const meta = input.canonByDocType[k];
    if (!meta) continue;
    const periods = meta.periods.length;
    let years: number|undefined = undefined;
    // crude years estimation for annual strings like YYYY
    const annuals = meta.periods.filter(p => /^\d{4}$/.test(p));
    if (annuals.length) {
      const sorted = annuals.sort();
      const first = parseInt(sorted[0]!, 10);
      const last = parseInt(sorted[sorted.length-1]!, 10);
      years = (isFinite(first) && isFinite(last)) ? (last - first + 1) : undefined;
    }
    (coverage as any)[k] = {
      periods,
      years,
      periodicity: input.periodicityByType?.[k]
    };
  }

  return {
    deal_id: input.dealId,
    expected,
    present,
    missing,
    coverage,
    notes: []
  };
}


