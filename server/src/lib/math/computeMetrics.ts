import { RATIO_REGISTRY, type PeriodKey, type Periodicity, type CanonByPeriod } from "./ratios";

function pickLatest<T extends Record<PeriodKey, number|null>>(periods: PeriodKey[], map: T) {
  const sorted = [...periods].sort();
  const last = sorted[sorted.length - 1];
  return map[last] ?? null;
}

export function computeAllMetrics(input: {
  periods: PeriodKey[];
  periodicity: Periodicity;
  canon: CanonByPeriod;
}) {
  const { periods, periodicity, canon } = input;

  const flat: Record<string, number|null> = {};

  for (const def of RATIO_REGISTRY) {
    const out = def.compute({ periods, periodicity, canon });
    if (def.dealLevel) {
      flat[def.id] = out as number|null;
    } else {
      const per = out as Record<PeriodKey, number|null>;
      flat[def.id] = pickLatest(periods, per);
    }
  }

  return flat; // map of metricId -> number|null
}