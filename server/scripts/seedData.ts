import 'dotenv/config';
import path from 'path';
import fs from 'fs';

const API_BASE_URL = 'http://localhost:3001/api';

async function main() {
  const userId = 'user_123';

  // 1) Create two deals
  const deals = await Promise.all([
    createDeal('TechCorp Acquisition', 'Seeded deal - M&A diligence', userId),
    createDeal('FinAnalytics Pilot', 'Seeded deal - product pilot', userId),
  ]);

  // 2) Prepare sample CSV files
  const samplesDir = path.join(process.cwd(), '..', '..');
  const csv1 = path.join(samplesDir, 'sample1.csv');
  const csv2 = path.join(samplesDir, 'sample2.csv');
  fs.writeFileSync(csv1, 'header1,header2\n10,20\n30,40\n');
  fs.writeFileSync(csv2, 'header1,header2\n5,15\n25,35\n');

  // 3) Upload and parse one file per deal
  for (const [idx, deal] of deals.entries()) {
    const filePath = idx === 0 ? csv1 : csv2;
    await uploadAndParse(deal.id, filePath, userId);
  }

  // 4) Fetch documents for the first deal to verify
  const docs = await fetchJSON(`${API_BASE_URL}/files/deal/${deals[0].id}?user_id=${userId}`);
  console.log('Documents for first deal:', JSON.stringify(docs, null, 2));
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
