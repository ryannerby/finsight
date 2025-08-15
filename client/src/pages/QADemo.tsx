import React, { useState } from 'react';
import { QASection } from '@/components/qa';
import { EvidenceDrawer } from '@/components/results/EvidenceDrawer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock evidence data for demonstration
const mockEvidence = [
  {
    id: '1',
    excerpt: 'Revenue growth of 15% year-over-year with improving margins from 28% to 32% over the last three years.',
    metricId: 'Revenue Growth',
    sourceDocName: 'Financial Statements 2023',
    page: 12,
    row: 45,
    link: '#',
    confidence: 0.95,
    type: 'Income Statement',
    documentId: 'doc-001',
    extractedAt: '2024-01-15T10:30:00Z',
    extractedBy: 'AI Analysis'
  },
  {
    id: '2',
    excerpt: 'Working capital improved by $2.3M due to better inventory management and faster receivables collection.',
    metricId: 'Working Capital',
    sourceDocName: 'Balance Sheet Analysis',
    page: 8,
    row: 23,
    link: '#',
    confidence: 0.88,
    type: 'Balance Sheet',
    documentId: 'doc-002',
    extractedAt: '2024-01-15T10:32:00Z',
    extractedBy: 'AI Analysis'
  },
  {
    id: '3',
    excerpt: 'Cash flow from operations increased by 22% year-over-year, driven by improved working capital efficiency.',
    metricId: 'Operating Cash Flow',
    sourceDocName: 'Cash Flow Statement',
    page: 15,
    row: 67,
    link: '#',
    confidence: 0.92,
    type: 'Cash Flow',
    documentId: 'doc-003',
    extractedAt: '2024-01-15T10:35:00Z',
    extractedBy: 'AI Analysis'
  }
];

export default function QADemo() {
  const navigate = useNavigate();
  const [evidenceDrawerOpen, setEvidenceDrawerOpen] = useState(false);
  const [selectedSources, setSelectedSources] = useState<any[]>([]);

  const handleOpenEvidenceDrawer = (sources: any[]) => {
    setSelectedSources(sources);
    setEvidenceDrawerOpen(true);
  };

  const handleBackToDeals = () => {
    navigate('/deals');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleBackToDeals}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Deals
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-xl font-semibold text-foreground">Q&A Module Demo</h1>
              <p className="text-sm text-muted-foreground">
                Interactive financial Q&A with AI-powered insights
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Demo Info */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Demo Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Onboarding</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Clickable example questions</li>
                    <li>• Meaningful empty state</li>
                    <li>• Clear call-to-action</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">History & Organization</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Collapsible history sidebar</li>
                    <li>• Timestamps and status badges</li>
                    <li>• Click to reuse questions</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Streaming & Sources</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Typewriter streaming effect</li>
                    <li>• Source chips with evidence</li>
                    <li>• Copy and retry actions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Q&A Section */}
          <QASection
            dealId="demo-deal-123"
            onOpenEvidenceDrawer={handleOpenEvidenceDrawer}
          />
        </div>
      </div>

      {/* Evidence Drawer */}
      <EvidenceDrawer
        open={evidenceDrawerOpen}
        onOpenChange={setEvidenceDrawerOpen}
        items={selectedSources.length > 0 ? selectedSources : mockEvidence}
        title="Supporting Evidence"
      />
    </div>
  );
}
