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

  const handleDownloadReport = async () => {
    try {
      console.log('Testing PDF export from demo page...');
      
      // Use comprehensive HTML template for professional PDF export
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>Comprehensive Health Score Demo - PDF Export</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #1a202c;
              background: #ffffff;
              font-size: 12px;
            }
            
            .page {
              padding: 30px;
              max-width: 800px;
              margin: 0 auto;
            }
            
            .header {
              text-align: center;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 3px solid #2d3748;
            }
            
            .header h1 {
              font-size: 28px;
              font-weight: 700;
              color: #2d3748;
              margin-bottom: 8px;
            }
            
            .header .subtitle {
              font-size: 18px;
              color: #4a5568;
              font-weight: 600;
              margin-bottom: 8px;
            }
            
            .header .meta {
              font-size: 14px;
              color: #718096;
              font-weight: 400;
            }
            
            .health-summary {
              background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
              border: 2px solid #e2e8f0;
              border-radius: 12px;
              padding: 30px;
              margin-bottom: 40px;
              text-align: center;
            }
            
            .health-score-display {
              margin-bottom: 20px;
            }
            
            .health-score-number {
              font-size: 48px;
              font-weight: 800;
              color: ${sampleData.healthScore >= 80 ? '#059669' : sampleData.healthScore >= 60 ? '#d97706' : '#dc2626'};
              margin-bottom: 8px;
              text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .health-score-label {
              font-size: 16px;
              color: #4a5568;
              font-weight: 600;
              margin-bottom: 16px;
            }
            
            .recommendation-box {
              background: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            
            .recommendation-title {
              font-size: 16px;
              font-weight: 700;
              color: #2d3748;
              margin-bottom: 8px;
            }
            
            .recommendation-text {
              font-size: 14px;
              color: #4a5568;
              line-height: 1.5;
            }
            
            .traffic-lights-section {
              margin: 20px 0;
            }
            
            .traffic-lights-title {
              font-size: 14px;
              font-weight: 600;
              color: #4a5568;
              margin-bottom: 12px;
            }
            
            .traffic-lights-grid {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              justify-content: center;
            }
            
            .traffic-light {
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .traffic-light.green {
              background: #dcfce7;
              color: #166534;
              border: 1px solid #bbf7d0;
            }
            
            .traffic-light.yellow {
              background: #fef3c7;
              color: #92400e;
              border: 1px solid #fde68a;
            }
            
            .traffic-light.red {
              background: #fee2e2;
              color: #991b1b;
              border: 1px solid #fecaca;
            }
            
            .analysis-section {
              margin-bottom: 40px;
            }
            
            .section-title {
              font-size: 20px;
              font-weight: 700;
              color: #2d3748;
              margin-bottom: 20px;
              padding-bottom: 8px;
              border-bottom: 2px solid #e2e8f0;
            }
            
            .strengths-risks-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin: 20px 0;
            }
            
            .strengths-box, .risks-box {
              background: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 20px;
            }
            
            .strengths-box {
              border-left: 4px solid #059669;
            }
            
            .risks-box {
              border-left: 4px solid #dc2626;
            }
            
            .box-title {
              font-size: 16px;
              font-weight: 700;
              color: #2d3748;
              margin-bottom: 16px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            
            .strengths-box .box-title {
              color: #059669;
            }
            
            .risks-box .box-title {
              color: #dc2626;
            }
            
            .strength-item, .risk-item {
              background: #f7fafc;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 12px;
              margin-bottom: 8px;
              font-size: 12px;
              color: #4a5568;
            }
            
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e2e8f0;
              text-align: center;
              color: #718096;
              font-size: 11px;
            }
            
            .disclaimer {
              background: #fff5f5;
              border: 1px solid #fed7d7;
              border-radius: 6px;
              padding: 16px;
              margin: 20px 0;
              font-size: 11px;
              color: #742a2a;
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="header">
              <h1>Comprehensive Health Score Analysis</h1>
              <div class="subtitle">Demo Report</div>
              <div class="meta">
                Generated on ${new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} at ${new Date().toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>

            <div class="health-summary">
              <div class="health-score-display">
                <div class="health-score-number">${sampleData.healthScore}/100</div>
                <div class="health-score-label">Overall Health Score</div>
              </div>
              
              <div class="recommendation-box">
                <div class="recommendation-title">Analysis Recommendation</div>
                <div class="recommendation-text">${sampleData.recommendation}</div>
              </div>
              
              <div class="traffic-lights-section">
                <div class="traffic-lights-title">Risk Assessment by Category</div>
                <div class="traffic-lights-grid">
                  ${Object.entries(sampleData.trafficLights).map(([category, status]) => 
                    `<span class="traffic-light ${status}">${category.replace(/_/g, ' ')}</span>`
                  ).join('')}
                </div>
              </div>
            </div>

            <div class="analysis-section">
              <div class="section-title">Key Strengths</div>
              <div class="strengths-box">
                <div class="box-title">💪 Top Strengths</div>
                ${sampleData.topStrengths.map(strength => 
                  `<div class="strength-item">• ${strength}</div>`
                ).join('')}
              </div>
            </div>

            <div class="analysis-section">
              <div class="section-title">Risk Factors</div>
              <div class="risks-box">
                <div class="box-title">⚠️ Top Risks</div>
                ${sampleData.topRisks.map(risk => 
                  `<div class="risk-item">• ${risk}</div>`
                ).join('')}
              </div>
            </div>

            <div class="disclaimer">
              <strong>Demo Report:</strong> This is a demonstration of Finsight's comprehensive PDF export capabilities. 
              The data shown is sample data for testing purposes only.
            </div>

            <div class="footer">
              <p><strong>Generated by Finsight - Advanced Financial Analysis Platform</strong></p>
              <p>Professional-grade health score analysis and risk assessment</p>
              <p>Report ID: ${Date.now()}</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      console.log('HTML content generated, length:', htmlContent.length);
      console.log('Making request to export endpoint...');
      
      const response = await fetch('http://localhost:3001/api/export', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/pdf'
        },
        body: JSON.stringify({ html: htmlContent })
      });
      
      console.log('Response received:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Failed to generate PDF: ${response.status} ${response.statusText}`);
      }
      
      console.log('Creating blob from response...');
      const blob = await response.blob();
      console.log('Blob created, size:', blob.size);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-health-score-demo.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('PDF export completed successfully');
      alert('PDF export successful! Check your downloads folder.');
      
    } catch (error) {
      console.error('PDF export failed:', error);
      alert(`Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
