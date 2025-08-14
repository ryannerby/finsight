import 'dotenv/config';
import path from 'path';
import fs from 'fs';

const API_BASE_URL = 'http://localhost:3001/api';

// Sample deal data with realistic financial scenarios
const SAMPLE_DEALS = [
  {
    title: 'TechCorp Acquisition',
    description: 'Strategic acquisition of SaaS company with recurring revenue model. Due diligence for $50M deal.',
    industry: 'Technology',
    dealSize: 50000000,
    status: 'active'
  },
  {
    title: 'GreenEnergy Manufacturing',
    description: 'Due diligence for renewable energy equipment manufacturer. Evaluating $25M investment.',
    industry: 'Manufacturing',
    dealSize: 25000000,
    status: 'active'
  },
  {
    title: 'HealthTech Series B',
    description: 'Series B funding round for AI-powered healthcare diagnostics platform. $15M investment.',
    industry: 'Healthcare',
    dealSize: 15000000,
    status: 'active'
  },
  {
    title: 'RetailChain Restructuring',
    description: 'Turnaround opportunity for regional retail chain. Evaluating $8M distressed asset purchase.',
    industry: 'Retail',
    dealSize: 8000000,
    status: 'active'
  },
  {
    title: 'FinTech Partnership',
    description: 'Strategic partnership evaluation for payment processing startup. $12M joint venture.',
    industry: 'Financial Services',
    dealSize: 12000000,
    status: 'active'
  }
];

async function main() {
  const userId = 'user_123';
  console.log('🌱 Starting database seeding...');

  // 1) Create 5 deals
  const deals = await Promise.all(
    SAMPLE_DEALS.map(deal => 
      createDeal(deal.title, deal.description, userId)
    )
  );

  console.log(`✅ Created ${deals.length} deals`);

  // 2) Create sample documents for each deal with actual content
  for (const deal of deals) {
    await createSampleDocuments(deal.id, userId);
  }

  // 3) Create sample analyses for each deal
  for (const deal of deals) {
    await createSampleAnalyses(deal.id, userId);
  }

  // 4) Try to create sample Q&A for each deal (optional)
  console.log('📝 Attempting to create Q&A entries...');
  for (const deal of deals) {
    try {
      await createSampleQA(deal.id, userId);
    } catch (error) {
      console.log(`⚠️  Skipping Q&A for deal ${deal.id} due to: ${error.message}`);
    }
  }

  // 5) Try to create sample logs for each deal (optional)
  console.log('📝 Attempting to create log entries...');
  for (const deal of deals) {
    try {
      await createSampleLogs(deal.id, userId);
    } catch (error) {
      console.log(`⚠️  Skipping logs for deal ${deal.id} due to: ${error.message}`);
    }
  }

  console.log('\n🎉 Database seeding completed successfully!');
  console.log(`📊 Created ${deals.length} deals with comprehensive sample data`);
  console.log('\n📋 Summary of created data:');
  console.log(`   • ${deals.length} deals with realistic financial scenarios`);
  console.log(`   • ${deals.length * 5} documents (5 per deal) with actual content`);
  console.log(`   • ${deals.length * 3} analyses (3 per deal)`);
  console.log('\n💡 This provides plenty of demo data for the frontend!');
  console.log('🔗 You can now view these deals in your application.');
  console.log('\n⚠️  Note: Documents are created with metadata only. For full file processing,');
  console.log('   you would need to implement actual file storage or use the existing');
  console.log('   sample CSV files in docs/fixtures/sample_csv/');
}

async function createDeal(title: string, description: string, userId: string) {
  const deal = await fetchJSON(`${API_BASE_URL}/deals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, user_id: userId })
  });
  console.log(`✅ Created deal: ${deal.id} - ${title}`);
  return deal as { id: string };
}

async function createSampleDocuments(dealId: string, userId: string) {
  const documents = [
    {
      filename: 'financial_statements_2023.xlsx',
      original_name: 'Financial Statements 2023.xlsx',
      file_type: 'financial',
      mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      file_size: 245760,
      content: 'Sample financial data for 2023'
    },
    {
      filename: 'balance_sheet_2022_2023.csv',
      original_name: 'Balance Sheet 2022-2023.csv',
      file_type: 'balance_sheet',
      mime_type: 'text/csv',
      file_size: 15360,
      content: 'period,account,value\n2022,assets,10000000\n2022,liabilities,6000000\n2022,equity,4000000\n2023,assets,12000000\n2023,liabilities,7000000\n2023,equity,5000000'
    },
    {
      filename: 'profit_loss_2022_2023.csv',
      original_name: 'Profit & Loss 2022-2023.csv',
      file_type: 'P&L',
      mime_type: 'text/csv',
      file_size: 18432,
      content: 'period,account,value\n2022,revenue,5000000\n2022,cogs,3000000\n2022,net income,600000\n2023,revenue,5500000\n2023,cogs,3300000\n2023,net income,650000'
    },
    {
      filename: 'cash_flow_2022_2023.csv',
      original_name: 'Cash Flow 2022-2023.csv',
      file_type: 'cash_flow',
      mime_type: 'text/csv',
      file_size: 16384,
      content: 'period,account,value\n2022,operating_cash,800000\n2022,investing_cash,-2000000\n2022,financing_cash,1500000\n2023,operating_cash,900000\n2023,investing_cash,-2500000\n2023,financing_cash,1800000'
    },
    {
      filename: 'customer_analysis.pdf',
      original_name: 'Customer Analysis Report.pdf',
      file_type: 'other',
      mime_type: 'application/pdf',
      file_size: 512000,
      content: 'Customer analysis report content'
    }
  ];

  for (const doc of documents) {
    await createDocument(dealId, doc, userId);
  }
}

async function createDocument(dealId: string, docData: any, userId: string) {
  const doc = await fetchJSON(`${API_BASE_URL}/files`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      deal_id: dealId,
      filename: docData.filename,
      original_name: docData.original_name,
      file_path: `/uploads/${dealId}/${docData.filename}`,
      file_size: docData.file_size,
      mime_type: docData.mime_type,
      file_type: docData.file_type,
      user_id: userId
    })
  });
  console.log(`📄 Created document: ${doc.id} - ${docData.original_name}`);
  return doc;
}

async function createSampleAnalyses(dealId: string, userId: string) {
  const analyses = [
    {
      analysis_type: 'extraction',
      parsed_text: `Row 1:
period: 2022
account: revenue
value: 5000000

Row 2:
period: 2022
account: cogs
value: 3000000

Row 3:
period: 2022
account: net_income
value: 600000

Row 4:
period: 2023
account: revenue
value: 5500000

Row 5:
period: 2023
account: cogs
value: 3300000

Row 6:
period: 2023
account: net_income
value: 650000

Row 7:
period: 2024
account: revenue
value: 6200000

Row 8:
period: 2024
account: cogs
value: 3720000

Row 9:
period: 2024
account: net_income
value: 800000`,
      analysis_result: {
        revenue_growth: 15.2,
        gross_margin: 68.5,
        net_margin: 12.3,
        current_ratio: 2.1,
        debt_to_equity: 0.4
      }
    },
    {
      analysis_type: 'risk_assessment',
      analysis_result: {
        market_risk: 'medium',
        operational_risk: 'low',
        financial_risk: 'low',
        regulatory_risk: 'medium'
      }
    },
    {
      analysis_type: 'due_diligence',
      analysis_result: {
        data_quality_score: 85,
        completeness: 92,
        consistency: 88,
        recency: 95
      }
    }
  ];

  // Get documents for this deal to associate analyses
  const documents = await fetchJSON(`${API_BASE_URL}/files/deal/${dealId}?user_id=${userId}`);
  
  for (let i = 0; i < analyses.length && i < documents.length; i++) {
    const analysis = await fetchJSON(`${API_BASE_URL}/analyses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        document_id: documents[i].id,
        analysis_type: analyses[i].analysis_type,
        parsed_text: analyses[i].parsed_text,
        analysis_result: analyses[i].analysis_result,
        user_id: userId
      })
    });
    console.log(`🔍 Created analysis: ${analysis.id} - ${analyses[i].analysis_type}`);
  }
}

async function createSampleQA(dealId: string, userId: string) {
  const qaItems = [
    {
      question: 'What is the company\'s revenue growth trend over the past 3 years?',
      answer: 'The company has shown consistent revenue growth averaging 15.2% year-over-year, with particularly strong performance in Q3 and Q4 of 2023.',
      context: { document_ids: [], analysis_ids: [] }
    },
    {
      question: 'Are there any significant risks in the current financial position?',
      answer: 'The main risk factors include moderate market competition and potential regulatory changes in the industry. However, the company maintains strong liquidity ratios.',
      context: { document_ids: [], analysis_ids: [] }
    },
    {
      question: 'What is the quality of the financial data provided?',
      answer: 'Data quality is excellent with 92% completeness and 88% consistency. All financial statements are audited and up-to-date.',
      context: { document_ids: [], analysis_ids: [] }
    }
  ];

  for (const qa of qaItems) {
    const qaItem = await fetchJSON(`${API_BASE_URL}/qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deal_id: dealId,
        question: qa.question,
        answer: qa.answer,
        context: qa.context,
        asked_by: userId
      })
    });
    console.log(`❓ Created Q&A: ${qaItem.id} - ${qa.question.substring(0, 50)}...`);
  }
}

async function createSampleLogs(dealId: string, userId: string) {
  const logActions = [
    {
      action: 'created_deal',
      details: { deal_title: 'Sample Deal', deal_id: dealId }
    },
    {
      action: 'uploaded_document',
      details: { filename: 'financial_statements.xlsx', file_type: 'financial' }
    },
    {
      action: 'parsed_document',
      details: { document_id: 'sample_doc_id', analysis_type: 'financial' }
    },
    {
      action: 'asked_question',
      details: { question: 'Sample question about financials' }
    }
  ];

  for (const log of logActions) {
    const logEntry = await fetchJSON(`${API_BASE_URL}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deal_id: dealId,
        user_id: userId,
        action: log.action,
        details: log.details
      })
    });
    console.log(`📝 Created log: ${logEntry.id} - ${log.action}`);
  }
}

async function fetchJSON(url: string, init?: RequestInit) {
  try {
    const res = await fetch(url, init);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`${init?.method || 'GET'} ${url} failed: ${res.status} ${res.statusText} - ${errorText}`);
    }
    return res.json();
  } catch (error) {
    console.error(`❌ Error in ${init?.method || 'GET'} ${url}:`, error);
    throw error;
  }
}

main().catch(err => {
  console.error('💥 Seeding failed:', err);
  process.exit(1);
});
