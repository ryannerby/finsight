import { computeDDSignals } from '../ddSignals';
import type { CanonByPeriod, PeriodKey } from '../../lib/math/ratios';

function canon(period: string, data: Partial<CanonByPeriod[string]>): CanonByPeriod {
  return { [period]: data } as any;
}

describe('computeDDSignals boundary bands', () => {
  const period: PeriodKey = '2024';

  test('DSCR proxy bands at 2.0 and 1.25', () => {
    let signals = computeDDSignals({ dealId: 'd', periods: [period], canon: canon(period, { ebitda: 200, interest_expense: 100 }) });
    expect(signals.dscr_proxy.status).toBe('pass');

    signals = computeDDSignals({ dealId: 'd', periods: [period], canon: canon(period, { ebitda: 125, interest_expense: 100 }) });
    expect(signals.dscr_proxy.status).toBe('caution');

    signals = computeDDSignals({ dealId: 'd', periods: [period], canon: canon(period, { ebitda: 100, interest_expense: 100 }) });
    expect(signals.dscr_proxy.status).toBe('fail');
  });

  test('Concentration bands at 0.20 and 0.30', () => {
    let signals = computeDDSignals({ dealId: 'd', periods: [period], canon: canon(period, {}), concentrationRatio: 0.20 });
    expect(signals.concentration.status).toBe('pass');
    signals = computeDDSignals({ dealId: 'd', periods: [period], canon: canon(period, {}), concentrationRatio: 0.30 });
    expect(signals.concentration.status).toBe('caution');
    signals = computeDDSignals({ dealId: 'd', periods: [period], canon: canon(period, {}), concentrationRatio: 0.31 });
    expect(signals.concentration.status).toBe('fail');
  });

  test('CCC bands at 60 and 90 days', () => {
    // Construct canon to yield CCC = DSO + DIO - DPO
    // With annual periodicity (365 days), set ratios to produce exact 60 and 90
    // DSO = AR/Revenue * 365, DIO = Inv/COGS * 365, DPO = AP/COGS * 365
    // Choose values: DSO=30, DIO=60, DPO=30 -> CCC=60
    let signals = computeDDSignals({
      dealId: 'd', periods: [period], canon: canon(period, {
        accounts_receivable: 30, revenue: 365,
        inventory: 60, cogs: 365,
        accounts_payable: 30,
      })
    });
    expect(signals.working_capital_ccc.status).toBe('pass');

    // CCC=90: DSO=60, DIO=60, DPO=30 -> 90
    signals = computeDDSignals({
      dealId: 'd', periods: [period], canon: canon(period, {
        accounts_receivable: 60, revenue: 365,
        inventory: 60, cogs: 365,
        accounts_payable: 30,
      })
    });
    expect(signals.working_capital_ccc.status).toBe('caution');

    // CCC>90 -> fail
    signals = computeDDSignals({
      dealId: 'd', periods: [period], canon: canon(period, {
        accounts_receivable: 90, revenue: 365,
        inventory: 60, cogs: 365,
        accounts_payable: 30,
      })
    });
    expect(signals.working_capital_ccc.status).toBe('fail');
  });

  test('Current ratio bands at 1.2 and 1.5', () => {
    let signals = computeDDSignals({ dealId: 'd', periods: [period], canon: canon(period, { current_assets: 150, current_liabilities: 100 }) });
    expect(signals.current_ratio.status).toBe('pass');
    signals = computeDDSignals({ dealId: 'd', periods: [period], canon: canon(period, { current_assets: 120, current_liabilities: 100 }) });
    expect(signals.current_ratio.status).toBe('caution');
    signals = computeDDSignals({ dealId: 'd', periods: [period], canon: canon(period, { current_assets: 110, current_liabilities: 100 }) });
    expect(signals.current_ratio.status).toBe('fail');
  });
});


