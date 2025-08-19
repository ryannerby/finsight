import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileDropzone } from '@/components/ui/file-dropzone';
import { RevenueChart } from '@/components/ui/revenue-chart';
import { MetricCard } from '@/components/ui/metric-card';
import { BenchmarkLegend } from '@/components/ui/benchmark-legend';
import { ComprehensiveMetrics } from '@/components/ui/comprehensive-metrics';
import { HealthScoreRing } from '@/components/ui/health-score-ring';
import { HealthScoreDashboard } from '@/components/ui/health-score-dashboard';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { FinancialDisclaimer, AnalysisDisclaimer } from '@/components/ui/disclaimer';

import { FileList } from '@/components/FileList';
import { UploadProgress } from '@/components/UploadProgress';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useFiles } from '@/hooks/useFiles';
import { SaveDealButton } from '@/components/SaveDealButton';

const API_BASE_URL = 'http://localhost:3001/api';

const UploadTab = ({ dealId }: { dealId: string }) => {
  // Mock user ID - in real app this would come from auth context
  const userId = 'user_123';
  
  const { uploads, isUploading, uploadFiles, clearUploads, removeUpload } = useFileUpload();
  const { files, loading, error, refreshFiles } = useFiles(dealId, userId);
  
  const handleFilesSelected = async (selectedFiles: File[]) => {
    await uploadFiles(selectedFiles, dealId, userId);
    // Refresh the file list after upload completes
    setTimeout(() => {
      refreshFiles();
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Document Upload</h3>
        <FileDropzone
          onFilesSelected={handleFilesSelected}
          disabled={isUploading}
          acceptedFileTypes={[
            'application/pdf',
            'text/csv',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
          ]}
          maxFileSize={10}
          multiple={true}
        />
      </div>

      {uploads.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">Upload Progress</h4>
          <UploadProgress
            uploads={uploads}
            onRemove={removeUpload}
            onClear={clearUploads}
          />
        </div>
      )}
      
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium">Uploaded Documents</h4>
          <Button variant="ghost" size="sm" onClick={refreshFiles} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
        <FileList
          files={files}
          loading={loading}
          error={error}
          onRefresh={refreshFiles}
        />
      </div>
    </div>
  );
};

const SummaryTab = ({ deal, refreshKey }: { deal: any; refreshKey: number }) => {
  const userId = 'user_123';
  const { files, refreshFiles } = useFiles(deal.id, userId);
  const [showInventoryDetails, setShowInventoryDetails] = useState(false);
  const [showInventoryWhy, setShowInventoryWhy] = useState(false);
  const [metricsView, setMetricsView] = useState<'simple' | 'comprehensive'>('simple');
  const [execOpen, setExecOpen] = useState(true);
  const [signalsOpen, setSignalsOpen] = useState(true);
  const [inventoryOpen, setInventoryOpen] = useState(true);

  useEffect(() => {
    // when refreshKey changes, refetch files/analyses
    refreshFiles();
  }, [refreshKey, refreshFiles]);

  // Find the latest financial analysis attached to any document
  const financial = (() => {
    let latest: any | null = null;
    for (const f of files) {
      for (const a of f.analyses || []) {
        if (a.analysis_type === 'financial') {
          if (!latest || new Date(a.created_at) > new Date(latest.created_at)) {
            latest = a;
          }
        }
      }
    }
    return latest;
  })();

  const metrics = financial?.analysis_result?.metrics || {};
  const coverage = financial?.analysis_result?.coverage || {};
  const findLatestByType = (type: string) => {
    let latest: any | null = null;
    for (const f of files) {
      for (const a of f.analyses || []) {
        if (a.analysis_type === type) {
          if (!latest || new Date(a.created_at) > new Date(latest.created_at)) {
            latest = a;
          }
        }
      }
    }
    return latest;
  };

  const inventory = findLatestByType('doc_inventory');
  const ddSignals = findLatestByType('dd_signals');
  const ddChecklist = findLatestByType('dd_checklist');
  const summary = (() => {
    let latest: any | null = null;
    for (const f of files) {
      for (const a of f.analyses || []) {
        if (a.analysis_type === 'summary') {
          if (!latest || new Date(a.created_at) > new Date(latest.created_at)) {
            latest = a;
          }
        }
      }
    }
    return latest;
  })();

  const formatMetric = (key: string, val: number): string => {
    if (val == null || Number.isNaN(val)) return 'n/a';
    const asPct = (n: number) => `${(n * 100).toFixed(1)}%`;
    const asX = (n: number) => `${n.toFixed(2)}x`;
    const asDays = (n: number) => `${Math.round(n)} days`;
    if (['gross_margin','net_margin','revenue_cagr_3y'].includes(key)) return asPct(val);
    if (['current_ratio','debt_to_equity'].includes(key)) return asX(val);
    if (['ar_days','ap_days','dio_days','ccc_days'].includes(key)) return asDays(val);
    return String(val.toFixed(3));
  };

  // Extract revenue data from financial analysis for chart
  const getRevenueData = (): { year: string; revenue: number }[] => {
    if (!financial?.analysis_result?.revenue_data) {
      return [];
    }

    try {
      const revenueData = financial.analysis_result.revenue_data;
      if (Array.isArray(revenueData)) {
        return revenueData.map((item: any) => ({
          year: item.year || item.period || 'Unknown',
          revenue: typeof item.revenue === 'number' ? item.revenue : 0
        })).filter(item => item.revenue > 0);
      }
      
      // If it's an object with years as keys
      if (typeof revenueData === 'object') {
        return Object.entries(revenueData)
          .map(([year, revenue]) => ({
            year,
            revenue: typeof revenue === 'number' ? revenue : 0
          }))
          .filter(item => item.revenue > 0)
          .sort((a, b) => a.year.localeCompare(b.year));
      }
    } catch (error) {
      console.error('Error parsing revenue data:', error);
    }
    
    return [];
  };

  return (
    <div className="space-y-10">
      <div className="bg-card text-card-foreground border rounded-lg p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold tracking-tight">Deal Summary</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Comprehensive financial analysis and due diligence overview
            </p>
          </div>
          <div className="flex items-center gap-3">
            {financial && (
              <span className="text-sm text-muted-foreground">Updated {new Date(financial.created_at).toLocaleString()}</span>
            )}
            {financial && (
              <Button
                size="sm"
                variant="outline"
                data-export-pdf
                onClick={async () => {
                  try {
                    console.log('Starting PDF export...');
                    // Generate clean HTML content for PDF export
                    const dealTitle = deal?.title || 'Unknown Deal';
                    const healthScore = summary?.analysis_result?.health_score || 'N/A';
                    const recommendation = summary?.analysis_result?.recommendation || 'N/A';
                    
                    // Create a very simple, static HTML template to avoid corruption issues
                    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Deal Summary</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
            line-height: 1.6;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #ccc;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .health-section {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 30px;
        }
        .health-score {
            font-size: 36px;
            font-weight: bold;
            color: #059669;
            margin-bottom: 10px;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin: 20px 0;
        }
        .metric-card {
            border: 1px solid #ddd;
            padding: 15px;
            text-align: center;
            border-radius: 6px;
        }
        .metric-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 8px;
            text-transform: capitalize;
        }
        .metric-value {
            font-size: 18px;
            font-weight: bold;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Deal Summary</h1>
        <p><strong>${dealTitle}</strong></p>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>

    <div class="health-section">
        <div class="health-score">${healthScore}/100</div>
        <p><strong>Recommendation:</strong> ${recommendation}</p>
    </div>

    <h2>Key Financial Metrics</h2>
    <div class="metrics-grid">
        ${['gross_margin', 'net_margin', 'revenue_cagr_3y'].map(k => {
            const value = metrics?.[k];
            const formattedValue = value != null ? formatMetric(k, value) : 'N/A';
            return `
                <div class="metric-card">
                    <div class="metric-label">${k.replace(/_/g, ' ')}</div>
                    <div class="metric-value">${formattedValue}</div>
                </div>
            `;
        }).join('')}
    </div>

    <div class="footer">
        <p>Generated by Finsight - Financial Analysis Platform</p>
    </div>
</body>
</html>`;
                    
                    console.log('HTML content generated, length:', htmlContent.length);
                    console.log('HTML preview (first 500 chars):', htmlContent.substring(0, 500));
                    console.log('Making request to export endpoint...');
                    
                    const requestBody = { html: htmlContent };
                    console.log('Request body size:', JSON.stringify(requestBody).length);
                    
                    const response = await fetch('http://localhost:3001/api/export', {
                      method: 'POST',
                      headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/pdf'
                      },
                      body: JSON.stringify(requestBody)
                    }).catch(fetchError => {
                      console.error('Fetch error:', fetchError);
                      throw new Error(`Network error: ${fetchError.message}`);
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
                    a.download = `deal-summary-${deal.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    
                    console.log('PDF export completed successfully');
                  } catch (error) {
                    console.error('PDF export failed:', error);
                    alert(`Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
                  }
                }}
              >
                Export PDF
              </Button>
            )}
          </div>
        </div>
        {!financial && (
          <p className="text-muted-foreground">No analysis yet. Click Analyze on the top right to compute metrics.</p>
        )}
        {financial && (
          <>
            {/* Enhanced Health Score Dashboard */}
            {summary && summary.analysis_result && (
              <HealthScoreDashboard
                healthScore={summary.analysis_result.health_score}
                trafficLights={summary.analysis_result.traffic_lights || {}}
                recommendation={summary.analysis_result.recommendation}
                topStrengths={summary.analysis_result.top_strengths || []}
                topRisks={summary.analysis_result.top_risks || []}
                dataCompleteness={Object.keys(metrics).length > 0 ? Math.min((Object.keys(metrics).filter(k => metrics[k] != null).length / Object.keys(metrics).length) * 100, 100) : 0}
                confidenceScore={Math.max(60, 100 - (Object.values(summary.analysis_result.traffic_lights || {}).filter(v => v === 'red').length * 10))}
                onReviewConcerns={() => {
                  // Scroll to risks section or open a modal
                  const risksSection = document.getElementById('risks-section');
                  if (risksSection) {
                    risksSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                onDownloadReport={() => {
                  // Trigger PDF export
                  const exportButton = document.querySelector('[data-export-pdf]') as HTMLButtonElement;
                  if (exportButton) {
                    exportButton.click();
                  }
                }}
                onViewDetails={() => {
                  // Toggle to comprehensive metrics view
                  setMetricsView('comprehensive');
                }}
                className="mb-8"
              />
            )}

            {/* Metrics grouped */}
            <div className="space-y-6">
              {/* Metrics View Toggle */}
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Button
                    size="sm"
                    variant={metricsView === 'simple' ? 'default' : 'outline'}
                    onClick={() => setMetricsView('simple')}
                  >
                    Simple View
                  </Button>
                  <Button
                    size="sm"
                    variant={metricsView === 'comprehensive' ? 'default' : 'outline'}
                    onClick={() => setMetricsView('comprehensive')}
                  >
                    Comprehensive View
                  </Button>
                </div>
              </div>
              
              {/* Benchmark Legend */}
              <div className="max-w-3xl mx-auto">
                <BenchmarkLegend />
              </div>
              
              {/* Simple Metrics View */}
              {metricsView === 'simple' && (
                <>
                  <div className="max-w-3xl mx-auto">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2 text-center">Margins & Growth</h4>
                    {/* Mobile: swipeable */}
                    <div className="flex gap-3 overflow-x-auto sm:hidden -mx-1 px-1 snap-x">
                      {['gross_margin','net_margin','revenue_cagr_3y'].map((k) => (
                        <MetricCard
                          key={`m-${k}`}
                          metricId={k}
                          label={k.replace(/_/g,' ')}
                          value={metrics[k] == null ? 'n/a' : typeof metrics[k] === 'number' ? formatMetric(k, metrics[k]) : String(metrics[k])}
                          status={k.includes('margin') ? (metrics[k] != null && metrics[k] > 0.2 ? 'good' : metrics[k] != null && metrics[k] > 0.1 ? 'warning' : 'bad') : 'neutral'}
                          tooltip={`Computed ${k.replace(/_/g,' ')}`}
                          ariaLabel={`${k} metric`}
                          className="min-h-[96px] snap-start min-w-[200px]"
                        />
                      ))}
                    </div>
                    {/* Tablet/desktop grid - 3 fixed columns for perfect centering */}
                    <div className="hidden sm:grid grid-cols-3 place-items-center gap-6">
                      {['gross_margin','net_margin','revenue_cagr_3y'].map((k) => (
                        <MetricCard
                          key={k}
                          metricId={k}
                          label={k.replace(/_/g,' ')}
                          value={metrics[k] == null ? 'n/a' : typeof metrics[k] === 'number' ? formatMetric(k, metrics[k]) : String(metrics[k])}
                          status={k.includes('margin') ? (metrics[k] != null && metrics[k] > 0.2 ? 'warning' : metrics[k] != null && metrics[k] > 0.1 ? 'warning' : 'bad') : 'neutral'}
                          tooltip={`Computed ${k.replace(/_/g,' ')}`}
                          ariaLabel={`${k} metric`}
                          className="min-h-[96px]"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="max-w-3xl mx-auto">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2 text-center">Liquidity & Leverage</h4>
                    {/* Mobile: swipeable */}
                    <div className="flex gap-3 overflow-x-auto sm:hidden -mx-1 px-1 snap-x">
                      {['current_ratio','debt_to_equity','periodicity'].map((k) => (
                        <MetricCard
                          key={`l-${k}`}
                          metricId={k === 'periodicity' ? undefined : k}
                          label={k.replace(/_/g,' ')}
                          value={k === 'periodicity' ? (coverage.periodicity || '—') : metrics[k] == null ? 'n/a' : typeof metrics[k] === 'number' ? formatMetric(k, metrics[k]) : String(metrics[k])}
                          status={k === 'current_ratio' ? (metrics[k] != null && metrics[k] >= 1.5 ? 'good' : metrics[k] != null && metrics[k] >= 1.0 ? 'warning' : 'bad') : 'neutral'}
                          tooltip={`Computed ${k.replace(/_/g,' ')}`}
                          ariaLabel={`${k} metric`}
                          className="min-h-[96px] snap-start min-w-[200px]"
                        />
                      ))}
                    </div>
                    {/* Tablet/desktop grid - 3 fixed columns for perfect centering */}
                    <div className="hidden sm:grid grid-cols-3 place-items-center gap-6">
                      {['current_ratio','debt_to_equity','periodicity'].map((k) => (
                        <MetricCard
                          key={k}
                          metricId={k}
                          label={k.replace(/_/g,' ')}
                          value={k === 'periodicity' ? (coverage.periodicity || '—') : metrics[k] == null ? 'n/a' : typeof metrics[k] === 'number' ? formatMetric(k, metrics[k]) : String(metrics[k])}
                          status={k === 'current_ratio' ? (metrics[k] != null && metrics[k] >= 1.5 ? 'good' : metrics[k] != null && metrics[k] >= 1.0 ? 'warning' : 'bad') : 'neutral'}
                          tooltip={`Computed ${k.replace(/_/g,' ')}`}
                          ariaLabel={`${k} metric`}
                          className="min-h-[96px]"
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Additional Efficiency & Working Capital Metrics */}
                  <div className="max-w-3xl mx-auto">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2 text-center">Efficiency & Working Capital</h4>
                    {/* Mobile: swipeable */}
                    <div className="flex gap-3 overflow-x-auto sm:hidden -mx-1 px-1 snap-x">
                      {['ar_days','ap_days','inventory_turns','ccc_days'].map((k) => (
                        <MetricCard
                          key={`e-${k}`}
                          metricId={k}
                          label={k.replace(/_/g,' ')}
                          value={metrics[k] == null ? 'n/a' : typeof metrics[k] === 'number' ? formatMetric(k, metrics[k]) : String(metrics[k])}
                          tooltip={`Computed ${k.replace(/_/g,' ')}`}
                          ariaLabel={`${k} metric`}
                          className="min-h-[96px] snap-start min-w-[200px]"
                        />
                      ))}
                    </div>
                    {/* Tablet/desktop grid - 4 columns for efficiency metrics */}
                    <div className="hidden sm:grid grid-cols-4 place-items-center gap-4">
                      {['ar_days','ap_days','inventory_turns','ccc_days'].map((k) => (
                        <MetricCard
                          key={k}
                          metricId={k}
                          label={k.replace(/_/g,' ')}
                          value={metrics[k] == null ? 'n/a' : typeof metrics[k] === 'number' ? formatMetric(k, metrics[k]) : String(metrics[k])}
                          tooltip={`Computed ${k.replace(/_/g,' ')}`}
                          ariaLabel={`${k} metric`}
                          className="min-h-[96px]"
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              {/* Comprehensive Metrics View */}
              {metricsView === 'comprehensive' && (
                <ComprehensiveMetrics 
                  metrics={metrics} 
                  showLegend={false}
                />
              )}
            </div>

            {/* Revenue Trend Chart */}
            {financial && getRevenueData().length > 0 && (
              <div className="mt-8">
                <RevenueChart data={getRevenueData()} title="Revenue Trend" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Executive summary (LLM) */}
      {summary && summary.analysis_result && (
        <div className="bg-card text-card-foreground border rounded-lg p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold">Executive Summary</h3>
              <p className="text-sm text-muted-foreground mt-1">
                AI-generated insights and key findings
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-sm text-muted-foreground">Updated {new Date(summary.created_at).toLocaleString()}</span>
              <Button size="sm" variant="ghost" className="sm:hidden" onClick={()=>setExecOpen(v=>!v)}>{execOpen ? 'Hide' : 'Show'}</Button>
            </div>
          </div>
          <span className="sm:hidden block text-xs text-muted-foreground mb-2">Updated {new Date(summary.created_at).toLocaleString()}</span>
          <div className={execOpen ? '' : 'hidden sm:block'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-green-700 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Top Strengths
              </h4>
              <ul className="space-y-3">
                {(summary.analysis_result.top_strengths || []).map((it: any, idx: number) => (
                  <li key={`str-${idx}`} className="border border-green-200 rounded-lg p-4 bg-green-50/50">
                    <div className="font-medium text-green-900">{it.title}</div>
                    <div className="text-sm text-green-700 mt-1">
                      {it.evidence} {it.page ? <span className="ml-2 text-green-600">(page {it.page})</span> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div id="risks-section">
              <h4 className="font-semibold mb-3 text-red-700 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Top Risks
              </h4>
              <ul className="space-y-3">
                {(summary.analysis_result.top_risks || []).map((it: any, idx: number) => (
                  <li key={`risk-${idx}`} className="border border-red-200 rounded-lg p-4 bg-red-50/50">
                    <div className="font-medium text-red-900">{it.title}</div>
                    <div className="text-sm text-red-700 mt-1">
                      {it.evidence} {it.page ? <span className="ml-2 text-red-600">(page {it.page})</span> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Deterministic Due Diligence Signals */}
      {ddSignals && ddSignals.analysis_result && (
        <div className="bg-card text-card-foreground border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold">Due Diligence Signals</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Automated financial health indicators and risk assessment
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-sm text-muted-foreground">Updated {new Date(ddSignals.created_at).toLocaleString()}</span>
              <Button size="sm" variant="ghost" className="sm:hidden" onClick={()=>setSignalsOpen(v=>!v)}>{signalsOpen ? 'Hide' : 'Show'}</Button>
            </div>
          </div>
          <span className="sm:hidden block text-xs text-muted-foreground mb-2">Updated {new Date(ddSignals.created_at).toLocaleString()}</span>
          <div className={signalsOpen ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4'}>
            {Object.entries(ddSignals.analysis_result).filter(([k])=>k!=="deal_id").map(([k, v]: any)=>{
              const status = v?.status as string;
              const getStatusConfig = (status: string) => {
                switch (status) {
                  case 'pass': return {
                    bg: 'bg-green-50 border-green-200',
                    text: 'text-green-800',
                    badge: 'bg-green-100 text-green-700',
                    icon: '✓'
                  };
                  case 'caution': return {
                    bg: 'bg-yellow-50 border-yellow-200',
                    text: 'text-yellow-800',
                    badge: 'bg-yellow-100 text-yellow-700',
                    icon: '⚠'
                  };
                  case 'fail': return {
                    bg: 'bg-red-50 border-red-200',
                    text: 'text-red-800',
                    badge: 'bg-red-100 text-red-700',
                    icon: '✗'
                  };
                  default: return {
                    bg: 'bg-gray-50 border-gray-200',
                    text: 'text-gray-600',
                    badge: 'bg-gray-100 text-gray-600',
                    icon: '—'
                  };
                }
              };
              const config = getStatusConfig(status);
              const formatSignalValue = (name: string, value: any) => {
                if (typeof value !== 'number') return null;
                if (name === 'working_capital_ccc') return `${Math.round(value)} days`;
                if (name === 'current_ratio' || name === 'dscr_proxy') return `${value.toFixed(2)}x`;
                if (name === 'seasonality' || name === 'accrual_vs_cash_delta') return `${(value * 100).toFixed(1)}%`;
                return value.toFixed(3);
              };
              return (
                <div key={k} className={`border rounded-lg p-4 ${config.bg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`text-sm font-medium ${config.text} flex items-center gap-2`}>
                      <span aria-hidden>{config.icon}</span>
                      <span>{String(k).replace(/_/g,' ')}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.badge}`} aria-label={`Status ${status || 'NA'}`}>
                      {status?.toUpperCase() || 'NA'}
                    </span>
                  </div>
                  {v?.value != null && (
                    <div className={`text-xl font-bold ${config.text}`}>{formatSignalValue(k, v.value)}</div>
                  )}
                  {v?.detail && (
                    <div className={`text-xs ${config.text} opacity-80 mt-1`}>{v.detail}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Due Diligence Checklist (LLM) */}
      {ddChecklist && ddChecklist.analysis_result && (
        <div className="bg-card text-card-foreground border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Due Diligence Checklist</h3>
              <p className="text-sm text-muted-foreground mt-1">
                AI-generated checklist of key due diligence items
              </p>
            </div>
            <span className="text-sm text-muted-foreground">Updated {new Date(ddChecklist.created_at).toLocaleString()}</span>
          </div>
          {(() => {
            const items = (ddChecklist.analysis_result.items || []) as Array<any>;
            const groups: Record<string, any[]> = { todo: [], in_progress: [], done: [], na: [] };
            items.forEach(it => { if (groups[it.status]) groups[it.status].push(it); });
            const chip = (label: string, count: number, color: string) => (
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${color}`}>{label}: {count}</span>
            );
            const riskItems = [...groups.todo, ...groups.in_progress].slice(0, 5);
            const oppItems = groups.done.slice(0, 5);
            return (
              <>
                <div className="flex flex-wrap gap-3 mb-6">
                  {chip('To do', groups.todo.length, 'bg-red-100 text-red-700 border border-red-200')}
                  {chip('In progress', groups.in_progress.length, 'bg-yellow-100 text-yellow-700 border border-yellow-200')}
                  {chip('Done', groups.done.length, 'bg-green-100 text-green-700 border border-green-200')}
                  {chip('N/A', groups.na.length, 'bg-gray-100 text-gray-600 border border-gray-200')}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-red-700 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      Priority Items
                    </h4>
                    <ul className="space-y-3">
                      {riskItems.map((it, idx) => (
                        <li key={`riskc-${idx}`} className="border border-red-200 rounded-lg p-4 bg-red-50/50">
                          <div className="font-medium text-red-900">{it.label}</div>
                          {it.notes && <div className="text-sm text-red-700 mt-1">{it.notes}</div>}
                        </li>
                      ))}
                      {riskItems.length === 0 && (
                        <div className="text-sm text-muted-foreground italic">No immediate risks identified.</div>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-green-700 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Completed Items
                    </h4>
                    <ul className="space-y-3">
                      {oppItems.map((it, idx) => (
                        <li key={`oppc-${idx}`} className="border border-green-200 rounded-lg p-4 bg-green-50/50">
                          <div className="font-medium text-green-900">{it.label}</div>
                          {it.notes && <div className="text-sm text-green-700 mt-1">{it.notes}</div>}
                        </li>
                      ))}
                      {oppItems.length === 0 && (
                        <div className="text-sm text-muted-foreground italic">No completed items yet.</div>
                      )}
                    </ul>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Document Inventory (compact with optional details) */}
      {inventory && inventory.analysis_result && (() => {
        const expected: string[] = inventory.analysis_result.expected || [];
        const present: string[] = inventory.analysis_result.present || [];
        const missing: string[] = inventory.analysis_result.missing || [];
        const expectedCount = expected.length;
        const presentCount = present.length;
        const missingCount = missing.length;
        const completionPct = expectedCount > 0 ? Math.round((presentCount / expectedCount) * 100) : 0;
        const cov: Record<string, any> = inventory.analysis_result.coverage || {};
        const periodicities = Object.values(cov).map((v: any) => v?.periodicity).filter(Boolean) as string[];
        const periodicitySummary = periodicities.length === 0 ? '—' : new Set(periodicities).size === 1 ? periodicities[0] as string : 'mixed';
        return (
          <div className="bg-card text-card-foreground border rounded-lg p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-lg font-semibold">Document Inventory</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Document completeness and coverage analysis
                  </p>
                </div>
                <button
                  className="text-xs text-blue-600 underline underline-offset-2 hover:text-blue-800"
                  onClick={() => setShowInventoryWhy((v) => !v)}
                >
                  {showInventoryWhy ? 'Hide why' : 'Why this matters'}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-sm text-muted-foreground">Updated {new Date(inventory.created_at).toLocaleString()}</span>
                <Button size="sm" variant="ghost" className="sm:hidden" onClick={()=>setInventoryOpen(v=>!v)}>{inventoryOpen ? 'Hide' : 'Show'}</Button>
              </div>
            </div>
            <span className="sm:hidden block text-xs text-muted-foreground mb-2">Updated {new Date(inventory.created_at).toLocaleString()}</span>
            {showInventoryWhy && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Why Document Inventory Matters:</p>
                  <p>Ensures you have the minimum financial statements needed to compute metrics and run diligence. Missing items often block ratio analysis, cohort views, and cash conversion calculations.</p>
                </div>
              </div>
            )}
            {/* Summary strip */}
            <div className="space-y-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-lg">Completion</span>
                  <span className="text-2xl font-bold text-blue-600">{presentCount}/{expectedCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="px-3 py-1">Present: {presentCount}</Badge>
                  <Badge variant="destructive" className="px-3 py-1">Missing: {missingCount}</Badge>
                  <Badge variant="muted" className="px-3 py-1">Periodicity: {periodicitySummary}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-4 rounded-full transition-all duration-500 ${
                      completionPct >= 80 ? 'bg-green-500' : completionPct >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
                <div className="text-right text-sm font-medium text-gray-600">{completionPct}% Complete</div>
              </div>
            </div>
            <div className={inventoryOpen ? '' : 'hidden sm:block'}>
            {/* Details toggle */}
            <div className="flex items-center justify-end mb-3">
              <Button size="sm" variant="outline" onClick={() => setShowInventoryDetails((v) => !v)}>
                {showInventoryDetails ? 'Hide details' : 'Show details'}
              </Button>
            </div>
            {showInventoryDetails && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="text-sm font-semibold text-gray-700 mb-3">Expected Documents</div>
                    <div className="flex flex-wrap gap-2">
                      {expected.map((x: string) => (
                        <Badge key={`exp-${x}`} variant="muted" className="text-xs">{x.replace(/_/g,' ')}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <div className="text-sm font-semibold text-green-700 mb-3">Present Documents</div>
                    <div className="flex flex-wrap gap-2">
                      {present.map((x: string) => (
                        <Badge key={`pre-${x}`} variant="success" className="text-xs">{x.replace(/_/g,' ')}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="text-sm font-semibold text-red-700 mb-3">Missing Documents</div>
                    <div className="flex flex-wrap gap-2">
                      {missing.map((x: string) => (
                        <Badge key={`mis-${x}`} variant="destructive" className="text-xs">{x.replace(/_/g,' ')}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                {Object.keys(cov).length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(cov).map(([k, v]: any) => (
                      <div key={`cov-${k}`} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                        <div className="text-sm font-semibold text-blue-700 mb-2">{String(k).replace(/_/g,' ')}</div>
                        <div className="text-xs text-blue-600 space-y-1">
                          <div>Periods: {v?.periods ?? '—'}</div>
                          <div>Years: {v?.years ?? '—'}</div>
                          <div>Periodicity: {v?.periodicity ?? '—'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        );
      })()}

      {/* Disclaimers moved to bottom */}
      <div className="space-y-4">
        <FinancialDisclaimer />
        <AnalysisDisclaimer />
      </div>
      
    </div>
  );
};

const QATab = () => {
  const [question, setQuestion] = useState("");
  const [historyOpen, setHistoryOpen] = useState(true);
  const [history, setHistory] = useState<Array<{ q: string; a?: string; t: string }>>([]);
  const exampleQs = [
    'How have gross margins trended over the last 3 years?',
    'Is working capital improving? What is the CCC?',
    'Any red flags in seasonality or accruals?'
  ];
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="qa-input" className="sr-only">Ask a question about this deal’s financials</label>
        <div className="flex items-start gap-2">
          <input
            id="qa-input"
            value={question}
            onChange={(e)=>setQuestion(e.target.value)}
            placeholder="Ask a question about this deal’s financials…"
            className="flex-1 rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Q&A input"
          />
          <Button disabled={!question.trim()} onClick={()=>{
            setHistory([{ q: question.trim(), t: new Date().toLocaleString() }, ...history]);
            setQuestion("");
          }}>Ask</Button>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Examples: {exampleQs.map((x, i)=> (
            <button key={i} className="underline underline-offset-2 mr-2 hover:text-foreground" onClick={()=>setQuestion(x)}>{x}</button>
          ))}
        </div>
      </div>
      <div className="border rounded-md">
        <button className="w-full flex items-center justify-between px-3 py-2 text-sm" onClick={()=>setHistoryOpen(!historyOpen)}>
          <span className="font-medium">History</span>
          <span aria-hidden>{historyOpen ? '−' : '+'}</span>
        </button>
        {historyOpen && (
          <ul className="divide-y">
            {history.length === 0 && <li className="p-3 text-sm text-muted-foreground">No prior Q&A yet.</li>}
            {history.map((h, idx)=> (
              <li key={idx} className="p-3 text-sm">
                <div className="font-medium">Q: {h.q}</div>
                {h.a && <div className="text-muted-foreground mt-1">A: {h.a}</div>}
                <div className="text-xs text-muted-foreground mt-1">{h.t}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default function DealDetail() {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();
  // Single-page layout: Summary is the main, embed Upload and Q&A sections
  const [deal, setDeal] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisRefresh, setAnalysisRefresh] = useState(0);
  const [showUploadOnly, setShowUploadOnly] = useState(false);

  const handleBackToDeals = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/deals');
  };

  useEffect(() => {
    if (!dealId) return;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/deals/${dealId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Deal not found');
        const data = await res.json();
        setDeal(data);
      })
      .catch((e) => setError(e.message || 'Failed to load deal'))
      .finally(() => setLoading(false));
  }, [dealId]);

  // If there are no files uploaded yet, default to upload-only onboarding view
  const userId = 'user_123';
  const { files } = useFiles(dealId, userId);
  useEffect(() => {
    setShowUploadOnly((files || []).length === 0);
  }, [files]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  if (error || !deal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="border">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Deal Not Found</h2>
            <p className="text-muted-foreground mb-4">{error || "The deal you're looking for doesn't exist."}</p>
            <Button onClick={handleBackToDeals}>Back to Deals</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tabs removed in favor of a single consolidated page

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6 sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBackToDeals}>← Back to Deals</Button>
            <div>
              <h1 className="text-2xl font-bold">{deal.title}</h1>
                              {deal.description && <p className="text-muted-foreground">
                  {deal.description.includes('[METRICS:') 
                    ? deal.description.split('[METRICS:')[0].trim()
                    : deal.description
                  }
                </p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SaveDealButton
              dealId={deal.id}
              isSaved={deal.is_saved || false}
              onSaveChange={(isSaved) => {
                setDeal(prev => prev ? { ...prev, is_saved: isSaved } : null);
              }}
            />
            <span className="px-3 py-1 bg-muted text-foreground/80 rounded-full text-sm font-medium">
              Active
            </span>
            <span className="text-sm text-muted-foreground">
              Created: {new Date(deal.created_at).toLocaleDateString()}
            </span>
            <Button
              onClick={async () => {
                try {
                  setAnalyzing(true);
                  const res = await fetch(`${API_BASE_URL}/analyze`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dealId: deal.id, userId: 'user_123' })
                  });
                  if (!res.ok) throw new Error(await res.text());
                  setAnalysisRefresh((x) => x + 1);
                  setShowUploadOnly(false); // navigate to overview state
                } catch (e) {
                  alert(`Analyze failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
                } finally {
                  setAnalyzing(false);
                }
              }}
              disabled={analyzing}
            >
              {analyzing ? 'Analyzing…' : 'Analyze'}
            </Button>
          </div>
        </div>

        {/* Upload-only onboarding state */}
        {showUploadOnly ? (
          <div className="bg-card text-card-foreground border rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Upload</h3>
            <UploadTab dealId={deal.id} />
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setShowUploadOnly(false)} variant="secondary">Skip for now</Button>
            </div>
          </div>
                ) : (
          <div className="bg-card text-card-foreground border rounded-lg shadow-sm">
            <div className="p-6">
              <SummaryTab key={analysisRefresh} deal={deal} refreshKey={analysisRefresh} />
            </div>
          </div>
        )}

        {/* Embedded Upload and Q&A sections (compact) */}
        {!showUploadOnly && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-card text-card-foreground border rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold">Upload</h3>
                <Button size="sm" variant="outline" onClick={() => setShowUploadOnly(true)}>Upload more files</Button>
              </div>
              <div className="max-h-[480px] overflow-auto pr-1">
                <UploadTab dealId={deal.id} />
              </div>
            </div>
            <div className="bg-card text-card-foreground border rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold">Q&A</h3>
              </div>
              <div className="max-h-[480px] overflow-auto pr-1">
                <QATab />
              </div>
            </div>
          </div>
        )}
        {/* Low-key delete at bottom-right */}
        <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => setConfirmDelete(true)}
          >
            Delete Deal
          </Button>
        </div>

        {confirmDelete && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-card text-card-foreground border rounded-lg p-6 w-full max-w-md shadow-xl">
              <h3 className="text-lg font-semibold mb-2">Delete Deal</h3>
              <p className="text-muted-foreground mb-4">
                Are you sure you want to delete "{deal.title}"? This will remove associated documents and cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    try {
                      const res = await fetch(`${API_BASE_URL}/deals/${deal.id}?user_id=user_123`, { method: 'DELETE' });
                      if (!res.ok && res.status !== 204) throw new Error(await res.text());
                      navigate('/deals');
                    } catch (e) {
                      alert(`Failed to delete: ${e instanceof Error ? e.message : 'Unknown error'}`);
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
