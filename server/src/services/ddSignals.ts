import type { PeriodKey, CanonByPeriod } from "../lib/math/ratios";
import { computeAllMetrics } from "../lib/math/computeMetrics";
import type { TDDSignals } from "../schemas/analysis";

type Status = 'pass'|'caution'|'fail'|'na';

function latest<T>(periods: PeriodKey[], map: Record<PeriodKey, T|null|undefined>): T|null {
  const sorted = [...periods].sort();
  const last = sorted[sorted.length - 1];
  const v = map[last as PeriodKey];
  return (v == null ? null : (v as any));
}

export function computeDDSignals(input: {
  dealId: string;
  periods: PeriodKey[];
  canon: CanonByPeriod;
  concentrationRatio?: number; // optional: top customer or product revenue share (0..1)
}): TDDSignals {
  const { periods, canon, dealId } = input;
  const flat = computeAllMetrics({ periods, periodicity: inferPeriodicity(periods), canon });

  // DSCR proxy: EBITDA / interest_expense
  const ebitdaLatest = pickLatestNumber(periods, canon, 'ebitda');
  const interestLatest = pickLatestNumber(periods, canon, 'interest_expense');
  const dscrProxy = (ebitdaLatest == null || interestLatest == null || interestLatest === 0) ? null : (ebitdaLatest / interestLatest);
  const dscrStatus: Status = dscrProxy == null ? 'na' : (dscrProxy >= 2.0 ? 'pass' : (dscrProxy >= 1.25 ? 'caution' : 'fail'));

  // Concentration: top customer or product ratio — allow caller to provide
  const concentration = input.concentrationRatio ?? null;
  const concentrationStatus: Status = concentration == null ? 'na' : (concentration <= 0.20 ? 'pass' : (concentration <= 0.30 ? 'caution' : 'fail'));

  // Working capital: CCC and Current ratio
  const cccDays = flat['ccc_days'] as number | null;
  const currentRatio = flat['current_ratio'] as number | null;
  const cccStatus: Status = cccDays == null ? 'na' : (cccDays <= 60 ? 'pass' : (cccDays <= 90 ? 'caution' : 'fail'));
  const crStatus: Status = currentRatio == null ? 'na' : (currentRatio >= 1.5 ? 'pass' : (currentRatio >= 1.2 ? 'caution' : 'fail'));

  // Seasonality: quarterly CV of revenue — needs at least 4 quarters
  const quarterlyPeriods = periods.filter(p => /^\d{4}-Q[1-4]$/.test(p)).sort();
  let seasonalityCV: number|null = null;
  if (quarterlyPeriods.length >= 4) {
    const revs = quarterlyPeriods.map(p => canon[p]?.revenue).filter((x): x is number => typeof x === 'number');
    if (revs.length >= 4) {
      const mean = revs.reduce((a,b)=>a+b,0) / revs.length;
      const variance = revs.reduce((a,b)=>a + Math.pow(b - mean, 2), 0) / revs.length;
      const stddev = Math.sqrt(variance);
      seasonalityCV = mean === 0 ? null : stddev / mean;
    }
  }
  const seasonalityStatus: Status = seasonalityCV == null ? 'na' : (seasonalityCV <= 0.15 ? 'pass' : (seasonalityCV <= 0.25 ? 'caution' : 'fail'));

  // Accrual vs cash delta: needs both revenue and cash flow from operations
  // proxy: |ΔAR| / revenue or |(Revenue - CFO)| / Revenue if both available
  const latestRevenue = pickLatestNumber(periods, canon, 'revenue');
  const latestCFO = pickLatestNumber(periods, canon, 'cfo');
  let accrualDelta: number|null = null;
  if (typeof latestRevenue === 'number' && latestRevenue !== 0) {
    if (typeof latestCFO === 'number') {
      accrualDelta = Math.abs(latestRevenue - latestCFO) / Math.abs(latestRevenue);
    } else {
      // fallback: change in AR as a rough proxy if we had multiple periods (not implemented without balances over time)
      accrualDelta = null;
    }
  }
  const accrualStatus: Status = accrualDelta == null ? 'na' : (accrualDelta <= 0.10 ? 'pass' : (accrualDelta <= 0.20 ? 'caution' : 'fail'));

  // Data sufficiency: 3 statements over >= 2 years
  const annuals = periods.filter(p => /^\d{4}$/.test(p)).sort();
  const yearsCount = annuals.length >= 2 ? annuals.length : inferYears(periods);
  // We do not know per-statement presence here; route will own inventory. Use periods as sufficiency proxy.
  const suffStatus: Status = yearsCount >= 2 && periods.length >= 3 ? 'pass' : (periods.length >= 2 ? 'caution' : 'fail');

  return {
    deal_id: dealId,
    dscr_proxy: { status: dscrStatus, value: dscrProxy ?? undefined, detail: 'Proxy: EBITDA / Interest Expense' },
    concentration: { status: concentrationStatus, value: concentration ?? undefined },
    working_capital_ccc: { status: cccStatus, value: cccDays ?? undefined },
    current_ratio: { status: crStatus, value: currentRatio ?? undefined },
    seasonality: { status: seasonalityStatus, value: seasonalityCV ?? undefined },
    accrual_vs_cash_delta: { status: accrualStatus, value: accrualDelta ?? undefined },
    data_sufficiency: { status: suffStatus }
  };
}

function pickLatestNumber(periods: PeriodKey[], canon: CanonByPeriod, key: keyof CanonByPeriod[string]): number|null {
  const sorted = [...periods].sort();
  const last = sorted[sorted.length - 1];
  const v = (canon[last]?.[key] as any);
  return typeof v === 'number' ? v : null;
}

function inferPeriodicity(keys: PeriodKey[]): 'monthly'|'quarterly'|'annual' {
  if (keys.some(k => /^\d{4}-\d{2}$/.test(k))) return 'monthly';
  if (keys.some(k => /^\d{4}-Q[1-4]$/.test(k))) return 'quarterly';
  return 'annual';
}

function inferYears(keys: PeriodKey[]): number {
  const years = keys
    .map(k => (k.match(/^(\d{4})/) || [])[1])
    .filter(Boolean)
    .map(Number)
    .sort();
  if (years.length === 0) return 0;
  return (years[years.length - 1]! - years[0]!) + 1;
}


