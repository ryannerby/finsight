import 'dotenv/config';
import path from 'path';
import fs from 'fs';

const API_BASE_URL = 'http://localhost:3001/api';

async function main() {
  const userId = 'user_123';

  // 1) Create deals with sample metrics
  const deals = await Promise.all([
    createDeal('TechCorp Acquisition', 'High-growth SaaS company with strong recurring revenue', userId),
    createDeal('FinAnalytics Pilot', 'Financial analytics platform with enterprise customers', userId),
    createDeal('GreenEnergy Solutions', 'Renewable energy startup with government contracts', userId),
    createDeal('MedTech Innovations', 'Healthcare technology company with FDA approval', userId),
  ]);

  // 2) Add sample metrics to deals
  await Promise.all([
    addSampleMetrics(deals[0].id, {
      health_score: 85,
      revenue: 8500000,
      profit_margin: 25,
      growth_rate: 35
    }, userId),
    addSampleMetrics(deals[1].id, {
      health_score: 72,
      revenue: 3200000,
      profit_margin: 18,
      growth_rate: 22
    }, userId),
    addSampleMetrics(deals[2].id, {
      health_score: 68,
      revenue: 1800000,
      profit_margin: 12,
      growth_rate: 45
    }, userId),
    addSampleMetrics(deals[3].id, {
      health_score: 91,
      revenue: 12500000,
      profit_margin: 32,
      growth_rate: 28
    }, userId),
  ]);

  // 3) Mark some deals as saved
  await Promise.all([
    saveDeal(deals[0].id, true, userId),
    saveDeal(deals[1].id, true, userId),
    saveDeal(deals[2].id, true, userId),
  ]);

  // 4) Use fixtures: multi-year financials and top customers
  const fixturesDir = path.resolve(__dirname, '../../docs/fixtures');
  const csvDir = path.join(fixturesDir, 'sample_csv');
  const pnl = path.join(csvDir, 'sample_pnl.csv');
  const bs = path.join(csvDir, 'sample_bs.csv');
  const cf = path.join(csvDir, 'sample_cf.csv');
  const topCustomersCsv = path.join(csvDir, 'top_customers.csv');
  if (!fs.existsSync(topCustomersCsv)) {
    fs.writeFileSync(topCustomersCsv, 'customer,share\nA Corp,0.18\nB LLC,0.12\nC Inc,0.10\n');
  }

  // 5) Upload and parse one file per deal
  for (const deal of deals) {
    for (const filePath of [pnl, bs, cf, topCustomersCsv]) {
      await uploadAndParse(deal.id, filePath, userId);
    }
  }

  // 6) Fetch documents for the first deal to verify
  const docs = await fetchJSON(`${API_BASE_URL}/files/deal/${deals[0].id}?user_id=${userId}`);
  console.log('Documents for first deal:', JSON.stringify(docs, null, 2));
  
  console.log('✅ Seed data created successfully!');
  console.log('📊 Deals with sample metrics and saved status created');
}

async function createDeal(title: string, description: string, userId: string) {
  const deal = await fetchJSON(`${API_BASE_URL}/deals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, user_id: userId })
  });
  console.log('Created deal:', deal.id, title);
  return deal as { id: string };
}

async function addSampleMetrics(dealId: string, metrics: any, userId: string) {
  // Store metrics in description field temporarily since health_score and metrics columns don't exist
  const metricsDescription = `[METRICS:${JSON.stringify(metrics)}]`;
  
  const { data, error } = await fetch(`${API_BASE_URL}/deals/${dealId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      description: metricsDescription,
      user_id: userId 
    })
  });
  
  if (error) {
    console.log('Note: Metrics update not implemented in API yet');
  } else {
    console.log('Added metrics to deal:', dealId);
  }
}

async function saveDeal(dealId: string, isSaved: boolean, userId: string) {
  const response = await fetch(`${API_BASE_URL}/deals/${dealId}/save`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, is_saved: isSaved })
  });
  
  if (response.ok) {
    console.log(`${isSaved ? 'Saved' : 'Unsaved'} deal:`, dealId);
  } else {
    console.log('Failed to update save status for deal:', dealId);
  }
}

async function uploadAndParse(dealId: string, filePath: string, userId: string) {
  const filename = path.basename(filePath);

  // Step 1: signed URL
  const { uploadUrl, path: storagePath } = await fetchJSON(`${API_BASE_URL}/files/upload-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, deal_id: dealId, user_id: userId })
  });

  // Step 2: PUT file to storage
  const fileBuffer = fs.readFileSync(filePath);
  const putRes = await fetch(uploadUrl, { method: 'PUT', body: fileBuffer, headers: { 'Content-Type': 'text/csv' } });
  if (!putRes.ok) throw new Error('PUT to signed URL failed');

  // Step 3: confirm
  const confirm = await fetchJSON(`${API_BASE_URL}/files/confirm-upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      deal_id: dealId,
      filename: storagePath.split('/').pop(),
      original_name: filename,
      file_path: storagePath,
      file_size: fileBuffer.length,
      mime_type: 'text/csv',
      user_id: userId
    })
  });

  // Step 4: parse
  const analysis = await fetchJSON(`${API_BASE_URL}/files/parse/${confirm.id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId })
  });

  console.log('Uploaded & parsed document:', confirm.id, 'analysis id:', analysis.id);
}

async function fetchJSON(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`${init?.method || 'GET'} ${url} failed: ${res.status} ${res.statusText}`);
  return res.json();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
