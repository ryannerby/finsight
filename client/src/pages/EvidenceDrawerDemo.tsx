import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EvidenceDrawer } from '@/components/results/EvidenceDrawer';

// Sample evidence data
const sampleEvidenceItems = [
  {
    id: '1',
    excerpt: 'Revenue increased by 15% year-over-year, driven by strong performance in the SaaS segment and expansion into new markets.',
    metricId: 'revenue_growth',
    sourceDocName: 'Annual Financial Report 2023',
    page: 12,
    row: 45,
    link: '/documents/annual-report-2023',
    confidence: 0.95,
    type: 'financial_data',
    documentId: 'doc_001',
    extractedAt: '2024-01-15T10:30:00Z',
    extractedBy: 'AI Analysis Engine'
  },
  {
    id: '2',
    excerpt: 'Gross margin improved from 65% to 68% due to operational efficiencies and reduced cost of goods sold.',
    metricId: 'gross_margin',
    sourceDocName: 'Q4 Financial Statement',
    page: 8,
    row: 23,
    link: '/documents/q4-statement',
    confidence: 0.88,
    type: 'financial_data',
    documentId: 'doc_002',
    extractedAt: '2024-01-10T14:20:00Z',
    extractedBy: 'AI Analysis Engine'
  },
  {
    id: '3',
    excerpt: 'Working capital ratio decreased to 1.2x, indicating potential liquidity concerns that require monitoring.',
    metricId: 'working_capital_ratio',
    sourceDocName: 'Balance Sheet Analysis',
    page: 15,
    row: 67,
    link: '/documents/balance-sheet',
    confidence: 0.72,
    type: 'financial_data',
    documentId: 'doc_003',
    extractedAt: '2024-01-08T09:15:00Z',
    extractedBy: 'AI Analysis Engine'
  }
];

export default function EvidenceDrawerDemo() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Evidence Drawer Demo</h1>
          <p className="text-lg text-muted-foreground">
            Test the EvidenceDrawer component with sample data
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Sample Metric Cards */}
          <div className="p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-lg mb-2">Revenue Growth</h3>
            <p className="text-3xl font-bold text-green-600 mb-2">+15%</p>
            <p className="text-sm text-muted-foreground mb-4">
              Strong year-over-year growth in SaaS segment
            </p>
            <Button 
              onClick={() => setDrawerOpen(true)}
              className="w-full"
            >
              View Evidence (3 items)
            </Button>
          </div>

          <div className="p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-lg mb-2">Gross Margin</h3>
            <p className="text-3xl font-bold text-blue-600 mb-2">68%</p>
            <p className="text-sm text-muted-foreground mb-4">
              Improved operational efficiency
            </p>
            <Button 
              onClick={() => setDrawerOpen(true)}
              className="w-full"
            >
              View Evidence (3 items)
            </Button>
          </div>

          <div className="p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-lg mb-2">Working Capital</h3>
            <p className="text-3xl font-bold text-yellow-600 mb-2">1.2x</p>
            <p className="text-sm text-muted-foreground mb-4">
              Requires monitoring
            </p>
            <Button 
              onClick={() => setDrawerOpen(true)}
              className="w-full"
            >
              View Evidence (3 items)
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-6 rounded-lg border bg-muted/30">
          <h3 className="font-semibold text-lg mb-3">Testing Instructions</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Click any "View Evidence" button to open the drawer</li>
            <li>• Test keyboard navigation (Tab, Enter, Escape)</li>
            <li>• Verify ARIA labels and screen reader support</li>
            <li>• Test responsive behavior (resize browser window)</li>
            <li>• Check focus management and keyboard trap</li>
          </ul>
        </div>
      </div>

      {/* Evidence Drawer */}
      <EvidenceDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        items={sampleEvidenceItems}
        title="Sample Evidence Items"
      />
    </div>
  );
}
