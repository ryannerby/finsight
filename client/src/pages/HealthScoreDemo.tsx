import React from 'react';
import { HealthScoreDashboard } from '@/components/ui/health-score-dashboard';

export default function HealthScoreDemo() {
  // Sample data for demonstration
  const sampleData = {
    healthScore: 78,
    trafficLights: {
      revenue_quality: 'green',
      margin_trends: 'yellow',
      liquidity: 'green',
      leverage: 'red',
      working_capital: 'yellow',
      data_quality: 'green'
    },
    recommendation: 'Caution' as const,
    topStrengths: [
      {
        title: 'Strong Revenue Growth',
        evidence: 'Revenue CAGR of 15.2% over 3 years',
        page: 12
      },
      {
        title: 'Healthy Gross Margins',
        evidence: 'Gross margin maintained at 42.3%',
        page: 8
      },
      {
        title: 'Strong Liquidity Position',
        evidence: 'Current ratio of 2.1x exceeds industry average',
        page: 15
      }
    ],
    topRisks: [
      {
        title: 'High Leverage Ratio',
        evidence: 'Debt-to-equity ratio of 2.8x is concerning',
        page: 22
      },
      {
        title: 'Working Capital Pressure',
        evidence: 'Cash conversion cycle increased to 45 days',
        page: 18
      },
      {
        title: 'Margin Compression',
        evidence: 'Net margin declined from 12% to 8.5%',
        page: 10
      }
    ],
    dataCompleteness: 85,
    confidenceScore: 78
  };

  const handleReviewConcerns = () => {
    alert('Review Concerns button clicked! This would scroll to the risks section in a real deal.');
  };

  const handleDownloadReport = () => {
    alert('Download Report button clicked! This would trigger PDF export in a real deal.');
  };

  const handleViewDetails = () => {
    alert('View Details button clicked! This would switch to comprehensive metrics view in a real deal.');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Score Dashboard Demo</h1>
        <p className="text-gray-600">
          This page demonstrates the enhanced health score dashboard component with actionable insights.
        </p>
      </div>

      <HealthScoreDashboard
        healthScore={sampleData.healthScore}
        trafficLights={sampleData.trafficLights}
        recommendation={sampleData.recommendation}
        topStrengths={sampleData.topStrengths}
        topRisks={sampleData.topRisks}
        dataCompleteness={sampleData.dataCompleteness}
        confidenceScore={sampleData.confidenceScore}
        onReviewConcerns={handleReviewConcerns}
        onDownloadReport={handleDownloadReport}
        onViewDetails={handleViewDetails}
      />

      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Component Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Visual Elements</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Prominent health score ring with color coding</li>
              <li>• Recommendation badge with contextual colors</li>
              <li>• Traffic light summary with counts</li>
              <li>• Confidence and data completeness indicators</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Interactive Features</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Quick action buttons for common tasks</li>
              <li>• Scroll-to-risks functionality</li>
              <li>• PDF export integration</li>
              <li>• Metrics view switching</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-blue-900">Usage Instructions</h2>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>Review Concerns:</strong> Click to scroll to the risks section and focus on areas needing attention.
          </p>
          <p>
            <strong>Download Report:</strong> Generate a comprehensive PDF report of the deal analysis.
          </p>
          <p>
            <strong>View Details:</strong> Switch to the comprehensive metrics view for deeper analysis.
          </p>
        </div>
      </div>
    </div>
  );
}
