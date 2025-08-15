import { RATIO_REGISTRY, type PeriodKey, type Periodicity, type CanonByPeriod } from "./ratios";

function pickLatestNonNull<T extends Record<PeriodKey, number|null>>(periods: PeriodKey[], map: T) {
  const sorted = [...periods].sort();
  for (let i = sorted.length - 1; i >= 0; i--) {
    const key = sorted[i]!;
    const val = map[key];
    if (typeof val === "number") return val;
  }
  return null;
}

export function computeAllMetrics(input: {
  periods: PeriodKey[];
  periodicity: Periodicity;
  canon: CanonByPeriod;
}, logger?: any) {
  const { periods, periodicity, canon } = input;

  const flat: Record<string, number|null> = {};

  if (logger) {
    logger.info('Starting metrics computation', {
      totalMetrics: RATIO_REGISTRY.length,
      periods: periods.slice(0, 5), // Log first 5 periods to avoid excessive logging
      periodicity
    });
  }

  for (const def of RATIO_REGISTRY) {
    try {
      const out = def.compute({ periods, periodicity, canon });
      
      if (def.dealLevel) {
        const value = out as number|null;
        flat[def.id] = value;
        
        if (logger) {
          logger.debug('Computed deal-level metric', {
            metric: def.id,
            label: def.label,
            value: value !== null ? Math.round(value * 1000) / 1000 : null, // Round to 3 decimal places
            status: value !== null ? 'computed' : 'missing_data',
            requires: def.requires
          });
        }
      } else {
        const perPeriodValues = out as Record<PeriodKey, number|null>;
        const latestValue = pickLatestNonNull(periods, perPeriodValues);
        flat[def.id] = latestValue;
        
        if (logger) {
          // Log a sample of period values for debugging
          const sampleValues = Object.entries(perPeriodValues)
            .slice(0, 3)
            .map(([period, value]) => ({
              period,
              value: value !== null ? Math.round(value * 1000) / 1000 : null
            }));
          
          logger.debug('Computed period-level metric', {
            metric: def.id,
            label: def.label,
            latestValue: latestValue !== null ? Math.round(latestValue * 1000) / 1000 : null,
            status: latestValue !== null ? 'computed' : 'missing_data',
            requires: def.requires,
            sampleValues,
            totalPeriods: Object.keys(perPeriodValues).length
          });
        }
      }
    } catch (error) {
      if (logger) {
        logger.warn('Error computing metric', {
          metric: def.id,
          label: def.label,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      flat[def.id] = null;
    }
  }

  if (logger) {
    const computedCount = Object.values(flat).filter(v => v !== null).length;
    const missingCount = Object.values(flat).filter(v => v === null).length;
    
    logger.info('Metrics computation completed', {
      totalMetrics: Object.keys(flat).length,
      computed: computedCount,
      missing: missingCount,
      successRate: `${((computedCount / Object.keys(flat).length) * 100).toFixed(1)}%`
    });
  }

  return flat; // map of metricId -> number|null
}