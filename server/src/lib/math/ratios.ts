import type { Canon } from "../normalize/accounts";

export type Periodicity = "monthly"|"quarterly"|"annual";
export type PeriodKey = string; // "2024", "2024-Q1", "2024-01"
export type CanonByPeriod = Record<PeriodKey, Partial<Canon>>;

function periodDays(_p: PeriodKey, periodicity: Periodicity) {
  if (periodicity === "monthly") return 30;
  if (periodicity === "quarterly") return 90;
  return 365;
}

type RatioCtx = {
  periods: PeriodKey[];
  periodicity: Periodicity;
  canon: CanonByPeriod;
};

type RatioDef =
  | {
      id: string;
      label: string;
      requires: (keyof Canon)[];
      dealLevel: true;
      compute: (ctx: RatioCtx) => number|null;
    }
  | {
      id: string;
      label: string;
      requires: (keyof Canon)[];
      dealLevel?: false;
      compute: (ctx: RatioCtx) => Record<PeriodKey, number|null>;
    };

export const RATIO_REGISTRY: RatioDef[] = [
  {
    id: "gross_margin",
    label: "Gross Margin",
    requires: ["gross_profit","revenue"],
    compute: ({periods, canon}) => Object.fromEntries(periods.map(p => {
      const gp = canon[p]?.gross_profit, rev = canon[p]?.revenue;
      return [p, (!gp || !rev) ? null : (rev === 0 ? null : gp/rev)];
    })),
  },
  {
    id: "net_margin",
    label: "Net Margin",
    requires: ["net_income","revenue"],
    compute: ({periods, canon}) => Object.fromEntries(periods.map(p => {
      const ni = canon[p]?.net_income, rev = canon[p]?.revenue;
      return [p, (!ni || !rev) ? null : (rev === 0 ? null : ni/rev)];
    })),
  },
  {
    id: "current_ratio",
    label: "Current Ratio",
    requires: ["current_assets","current_liabilities"],
    compute: ({periods, canon}) => Object.fromEntries(periods.map(p => {
      const ca = canon[p]?.current_assets, cl = canon[p]?.current_liabilities;
      const v = (ca == null || cl == null || cl === 0) ? null : ca / cl;
      return [p, v];
    })),
  },
  {
    id: "debt_to_equity",
    label: "Debt to Equity",
    requires: ["total_debt","shareholders_equity"],
    compute: ({periods, canon}) => Object.fromEntries(periods.map(p => {
      const d = canon[p]?.total_debt, eq = canon[p]?.shareholders_equity;
      const v = (d == null || eq == null || eq === 0) ? null : d / eq;
      return [p, v];
    })),
  },
  {
    id: "quick_ratio",
    label: "Quick Ratio",
    requires: ["cash","marketable_securities","accounts_receivable","current_liabilities"],
    compute: ({periods, canon}) => Object.fromEntries(periods.map(p => {
      const c = canon[p]?.cash, ms = canon[p]?.marketable_securities ?? 0, ar = canon[p]?.accounts_receivable, cl = canon[p]?.current_liabilities;
      if (c == null || ar == null || cl == null || cl === 0) return [p, null];
      return [p, (c + ms + ar) / cl];
    })),
  },
  {
    id: "ar_days",
    label: "AR Days (DSO)",
    requires: ["accounts_receivable","revenue"],
    compute: ({periods, canon, periodicity}) => Object.fromEntries(periods.map(p => {
      const ar = canon[p]?.accounts_receivable, rev = canon[p]?.revenue;
      const v = (ar == null || rev == null || rev === 0) ? null : (ar / rev) * periodDays(p, periodicity);
      return [p, v];
    })),
  },
  {
    id: "ap_days",
    label: "AP Days (DPO)",
    requires: ["accounts_payable","cogs"],
    compute: ({periods, canon, periodicity}) => Object.fromEntries(periods.map(p => {
      const ap = canon[p]?.accounts_payable, cogs = canon[p]?.cogs;
      const v = (ap == null || cogs == null || cogs === 0) ? null : (ap / cogs) * periodDays(p, periodicity);
      return [p, v];
    })),
  },
  {
    id: "dio_days",
    label: "Inventory Days (DIO)",
    requires: ["inventory","cogs"],
    compute: ({periods, canon, periodicity}) => Object.fromEntries(periods.map(p => {
      const inv = canon[p]?.inventory, cogs = canon[p]?.cogs;
      const v = (inv == null || cogs == null || cogs === 0) ? null : (inv / cogs) * periodDays(p, periodicity);
      return [p, v];
    })),
  },
  {
    id: "ccc_days",
    label: "Cash Conversion Cycle",
    requires: [],
    compute: ({periods, canon, periodicity}) => {
      const dso = (RATIO_REGISTRY.find(r=>r.id==="ar_days")!.compute({periods, canon, periodicity}) as Record<string, number|null>);
      const dio = (RATIO_REGISTRY.find(r=>r.id==="dio_days")!.compute({periods, canon, periodicity}) as Record<string, number|null>);
      const dpo = (RATIO_REGISTRY.find(r=>r.id==="ap_days")!.compute({periods, canon, periodicity}) as Record<string, number|null>);
      return Object.fromEntries(periods.map(p => {
        const parts = [dso[p], dio[p], dpo[p]];
        const v = parts.every(x => typeof x === "number") ? (dso[p]! + dio[p]! - dpo[p]!) : null;
        return [p, v];
      }));
    },
  },
  {
    id: "revenue_cagr_3y",
    label: "Revenue CAGR (3y)",
    requires: ["revenue"],
    dealLevel: true,
    compute: ({periods, canon}) => {
      // prefer annual if available
      const annuals = periods.filter(p => /^\d{4}$/.test(p)).sort();
      const arr = (annuals.length >= 4 ? annuals : periods).sort();
      const tIdx = arr.length - 1, t3Idx = arr.length - 4;
      if (t3Idx < 0) return null;
      const t = arr[tIdx], t3 = arr[t3Idx];
      const revT = canon[t]?.revenue, revT3 = canon[t3]?.revenue;
      if (revT == null || revT3 == null || revT3 === 0) return null;
      return Math.pow(revT / revT3, 1/3) - 1;
    },
  },
];