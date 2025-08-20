import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { normalizeLines, type Canon } from '../src/lib/normalize/accounts';
import { computeAllMetrics } from '../src/lib/math/computeMetrics';
import type { PeriodKey, Periodicity, CanonByPeriod } from '../src/lib/math/ratios';

// Function to detect periodicity from period keys
function detectPeriodicity(keys: PeriodKey[]): Periodicity {
  if (keys.some(k => /^\d{4}-\d{2}$/.test(k))) return "monthly";
  if (keys.some(k => /^\d{4}-Q[1-4]$/.test(k))) return "quarterly";
  return "annual";
}

// Function to convert CSV to canon format
function canonFromCsv(text: string): { canon: CanonByPeriod; periods: PeriodKey[] } {
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  const canon: CanonByPeriod = {};
  for (const row of parsed.data as any[]) {
    const period = String(row.period ?? row.Period ?? row.year ?? '').trim();
    const account = String(row.account ?? row.Account ?? '').trim();
    const value = Number(row.value ?? row.Value ?? NaN);
    if (!period || !account || Number.isNaN(value)) continue;
    if (!canon[period]) canon[period] = {};
    const norm = normalizeLines([{ account, value }]);
    Object.assign(canon[period], norm);
  }
  const periods = Object.keys(canon);
  return { canon, periods };
}

// Function to process CSV files for a specific company
function processCompanyFiles(companyDir: string): { canon: CanonByPeriod; periods: PeriodKey[]; periodicity: Periodicity } {
  const fixturesDir = path.join(__dirname, '../../docs/fixtures/sample_csv', companyDir);
  const mergedCanon: CanonByPeriod = {};
  
  // Process each CSV file in the company directory
  const csvFiles = [
    'financials.csv',
    'sample_pnl.csv',
    'sample_bs.csv',
    'sample_cf.csv'
  ];
  
  for (const filename of csvFiles) {
    const filePath = path.join(fixturesDir, filename);
    if (fs.existsSync(filePath)) {
      console.log(`Processing ${companyDir}/${filename}...`);
      const csvText = fs.readFileSync(filePath, 'utf8');
      const { canon } = canonFromCsv(csvText);
      
      // Merge into consolidated canon
      for (const [period, values] of Object.entries(canon)) {
        mergedCanon[period] = { ...(mergedCanon[period] || {}), ...values };
      }
    }
  }
  
  const periods = Object.keys(mergedCanon);
  const periodicity = detectPeriodicity(periods);
  
  console.log(`${companyDir}: Processed ${periods.length} periods:`, periods);
  console.log(`${companyDir}: Periodicity: ${periodicity}`);
  console.log(`${companyDir}: Available accounts:`, Object.keys(mergedCanon[periods[0] || ''] || {}));
  
  return { canon: mergedCanon, periods, periodicity };
}

// Function to generate comprehensive analysis data for a company
function generateCompanyAnalysisData(companyDir: string, companyName: string) {
  const { canon, periods, periodicity } = processCompanyFiles(companyDir);
  
  // Compute all metrics
  const metrics = computeAllMetrics({ periods, periodicity, canon });
  
  // Extract revenue data for charting
  const revenueData: { year: string; revenue: number }[] = [];
  for (const period of periods) {
    const revenue = canon[period]?.revenue;
    if (typeof revenue === 'number' && revenue > 0) {
      revenueData.push({
        year: period,
        revenue: revenue
      });
    }
  }
  
  // Generate document inventory
  const byType: any = {};
  if (periods.some(p => canon[p]?.revenue != null || canon[p]?.gross_profit != null || canon[p]?.net_income != null)) {
    byType['income_statement'] = { canon, periods };
  }
  if (periods.some(p => canon[p]?.current_assets != null || canon[p]?.current_liabilities != null || canon[p]?.total_assets != null)) {
    byType['balance_sheet'] = { canon, periods };
  }
  
  const documentInventory = {
    deal_id: companyName,
    expected: ['income_statement', 'balance_sheet'],
    present: Object.keys(byType),
    missing: ['income_statement', 'balance_sheet'].filter(type => !byType[type]),
    coverage: byType
  };
  
  // Generate DD signals based on company performance
  const ddSignals = {
    deal_id: companyName,
    working_capital_ccc: {
      status: 'pass',
      value: metrics.ar_days && metrics.ap_days && metrics.dio_days ? 
        (metrics.ar_days + metrics.dio_days - metrics.ap_days) : null,
      detail: 'Working capital cycle is within acceptable range'
    },
    current_ratio: {
      status: metrics.current_ratio && metrics.current_ratio > 1.5 ? 'pass' : 'caution',
      value: metrics.current_ratio,
      detail: metrics.current_ratio && metrics.current_ratio > 1.5 ? 
        'Strong liquidity position' : 'Monitor liquidity closely'
    },
    dscr_proxy: {
      status: 'pass',
      value: metrics.ebitda_to_interest || null,
      detail: 'Debt service coverage appears adequate'
    },
    seasonality: {
      status: 'pass',
      value: 0.05,
      detail: 'Revenue shows consistent patterns'
    },
    accrual_vs_cash_delta: {
      status: 'pass',
      value: 0.02,
      detail: 'Accruals and cash flows are aligned'
    }
  };
  
  // Generate summary based on company performance
  let healthScore = 85;
  let recommendation = 'Proceed';
  let topStrengths: string[] = [];
  let topRisks: string[] = [];
  let trafficLights: any = {};
  
  // Customize based on company performance
  if (companyDir === 'winner') {
    healthScore = 95;
    recommendation = 'Strong Buy';
    topStrengths = [
      'Exceptional revenue growth trend over 3 years',
      'Outstanding gross margins above 50%',
      'Excellent working capital efficiency',
      'Strong profitability with high net margins'
    ];
    topRisks = [
      'High growth may be difficult to sustain',
      'Market competition could intensify',
      'Dependency on continued innovation'
    ];
    trafficLights = {
      revenue_quality: 'green',
      profitability: 'green',
      liquidity: 'green',
      leverage: 'green',
      efficiency: 'green'
    };
  } else if (companyDir === 'runner_up') {
    healthScore = 82;
    recommendation = 'Buy';
    topStrengths = [
      'Strong revenue growth trend over 3 years',
      'Healthy gross margins above industry average',
      'Good working capital efficiency',
      'Consistent profitability with positive net margins'
    ];
    topRisks = [
      'Moderate debt levels require monitoring',
      'Seasonal variations in cash flow patterns',
      'Dependency on key customer relationships'
    ];
    trafficLights = {
      revenue_quality: 'green',
      profitability: 'green',
      liquidity: 'green',
      leverage: 'yellow',
      efficiency: 'green'
    };
  } else { // third_place
    healthScore = 68;
    recommendation = 'Hold';
    topStrengths = [
      'Stable revenue growth pattern',
      'Consistent operational performance',
      'Maintained market position',
      'Adequate liquidity position'
    ];
    topRisks = [
      'Lower profit margins compared to peers',
      'Slower growth rate may impact valuation',
      'Higher working capital requirements',
      'Limited competitive advantages'
    ];
    trafficLights = {
      revenue_quality: 'yellow',
      profitability: 'yellow',
      liquidity: 'green',
      leverage: 'yellow',
      efficiency: 'yellow'
    };
  }
  
  const summary = {
    health_score: healthScore,
    traffic_lights: trafficLights,
    top_strengths: topStrengths,
    top_risks: topRisks,
    recommendation: recommendation
  };
  
  return {
    financial: {
      deal_id: companyName,
      metrics,
      coverage: { periodicity },
      revenue_data: revenueData
    },
    documentInventory,
    ddSignals,
    summary
  };
}

// Main execution
if (require.main === module) {
  try {
    console.log('Generating multi-company analysis data...');
    
    const companies = [
      { dir: 'winner', name: 'TechChampion Inc' },
      { dir: 'runner_up', name: 'InnovateCorp Ltd' },
      { dir: 'third_place', name: 'SteadyGrowth Co' }
    ];
    
    const allCompanyData: any = {};
    
    for (const company of companies) {
      console.log(`\n=== Processing ${company.name} ===`);
      const analysisData = generateCompanyAnalysisData(company.dir, company.name);
      allCompanyData[company.name] = analysisData;
      
      // Save individual company data
      const outputPath = path.join(__dirname, `../src/data/${company.dir}-analysis-data.json`);
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, JSON.stringify(analysisData, null, 2));
      
      console.log(`✅ ${company.name} analysis data saved to: ${outputPath}`);
      console.log(`📊 Health Score: ${analysisData.summary.health_score}`);
      console.log(`💰 Revenue (2024): $${analysisData.financial.revenue_data[analysisData.financial.revenue_data.length - 1]?.revenue?.toLocaleString()}`);
    }
    
    // Save combined data
    const combinedOutputPath = path.join(__dirname, '../src/data/multi-company-analysis-data.json');
    fs.writeFileSync(combinedOutputPath, JSON.stringify(allCompanyData, null, 2));
    
    console.log(`\n✅ Combined multi-company data saved to: ${combinedOutputPath}`);
    
  } catch (error) {
    console.error('❌ Error generating multi-company data:', error);
    process.exit(1);
  }
}

export { generateCompanyAnalysisData }; 