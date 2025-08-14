import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileDropzone } from '@/components/ui/file-dropzone';
import { RevenueChart } from '@/components/ui/revenue-chart';
import { MetricCard } from '@/components/ui/metric-card';
import { HealthScoreRing } from '@/components/ui/health-score-ring';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';

import { FileList } from '@/components/FileList';
import { UploadProgress } from '@/components/UploadProgress';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useFiles } from '@/hooks/useFiles';
import { useAnalysisReport } from '@/hooks/useAnalysisReport';
import { HealthScore } from '@/components/report/HealthScore';
import { TrafficLights } from '@/components/report/TrafficLights';
import { StrengthsRisks } from '@/components/report/StrengthsRisks';
import { Recommendation } from '@/components/report/Recommendation';
import { AppShell } from '@/components/layout/AppShell';
import { ResultsHeader } from '@/components/results';

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
      <div className="bg-card text-card-foreground border rounded-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold tracking-tight">Deal Summary</h3>
          <div className="flex items-center gap-3">
            {financial && (
              <span className="text-sm text-muted-foreground">Updated {new Date(financial.created_at).toLocaleString()}</span>
            )}
            {financial && (
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  try {
                    // Generate HTML content for PDF export
                    const summaryContent = document.querySelector('.bg-card.text-card-foreground.border.rounded-lg.p-8')?.innerHTML || '';
                    const htmlContent = `
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <meta charset="utf-8">
                          <title>Deal Summary - ${deal.title}</title>
                          <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            .metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
                            .metric-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
                            .health-score { font-size: 24px; font-weight: bold; margin: 20px 0; }
                            .recommendation { margin: 20px 0; }
                            .traffic-lights { margin: 20px 0; }
                            .traffic-light { display: inline-block; margin: 5px; padding: 5px 10px; border-radius: 4px; }
                            .green { background-color: #dcfce7; color: #166534; }
                            .yellow { background-color: #fef3c7; color: #92400e; }
                            .red { background-color: #fee2e2; color: #991b1b; }
                          </style>
                        </head>
                        <body>
                          <h1>Deal Summary - ${deal.title}</h1>
                          <div class="health-score">Health Score: ${summary?.analysis_result?.health_score || 'N/A'}/100</div>
                          <div class="recommendation">Recommendation: ${summary?.analysis_result?.recommendation || 'N/A'}</div>
                          <div class="traffic-lights">
                            ${Object.entries(summary?.analysis_result?.traffic_lights || {}).map(([k, v]: any) => 
                              `<span class="traffic-light ${v}">${String(k).replace(/_/g, ' ')}: ${v}</span>`
                            ).join('')}
                          </div>
                          ${summaryContent}
                        </body>
                      </html>
                    `;
                    
                    const response = await fetch('http://localhost:3001/api/export', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ html: htmlContent })
                    });
                    
                    if (!response.ok) {
                      throw new Error('Failed to generate PDF');
                    }
                    
                    // Create blob and download
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `deal-summary-${deal.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                  } catch (error) {
                    console.error('PDF export failed:', error);
                    alert('Failed to export PDF. Please try again.');
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
            {/* Health score + recommendation */}
            {summary && summary.analysis_result && (
              <div className="flex items-center gap-6 mb-8">
                <HealthScoreRing
                  score={summary.analysis_result.health_score}
                  tooltip="Overall deal health based on liquidity, margins, growth, and volatility"
                />
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Recommendation</div>
                  <Badge
                    variant={summary.analysis_result.recommendation === 'Proceed' ? 'success' : summary.analysis_result.recommendation === 'Caution' ? 'warning' : 'destructive'}
                    aria-label={`Recommendation: ${summary.analysis_result.recommendation}`}
                    className="text-sm px-3 py-1"
                  >
                    {summary.analysis_result.recommendation}
                  </Badge>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {Object.entries(summary.analysis_result.traffic_lights || {}).map(([k, v]: any) => (
                      <Tooltip key={k} content={`Factor: ${String(k).replace(/_/g,' ')}`}>
                        <Badge variant={v === 'green' ? 'success' : v === 'yellow' ? 'warning' : 'destructive'}>
                          {String(k).replace(/_/g, ' ')}
                        </Badge>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Metrics grouped */}
            <div className="space-y-6">
              <div className="max-w-3xl mx-auto">
                <h4 className="text-sm font-semibold text-muted-foreground mb-2 text-center">Margins & Growth</h4>
                {/* Mobile: swipeable */}
                <div className="flex gap-3 overflow-x-auto sm:hidden -mx-1 px-1 snap-x">
                  {['gross_margin','net_margin','revenue_cagr_3y'].map((k) => (
                    <MetricCard
                      key={`m-${k}`}
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
                      label={k.replace(/_/g,' ')}
                      value={metrics[k] == null ? 'n/a' : typeof metrics[k] === 'number' ? formatMetric(k, metrics[k]) : String(metrics[k])}
                      status={k.includes('margin') ? (metrics[k] != null && metrics[k] > 0.2 ? 'good' : metrics[k] != null && metrics[k] > 0.1 ? 'warning' : 'bad') : 'neutral'}
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
        <div className="bg-card text-card-foreground border rounded-lg p-6">
          <div className="flex flex-wrap items-center justify-between mb-3">
            <h3 className="text-lg font-bold">Executive Summary</h3>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-sm text-muted-foreground">Updated {new Date(summary.created_at).toLocaleString()}</span>
              <Button size="sm" variant="ghost" className="sm:hidden" onClick={()=>setExecOpen(v=>!v)}>{execOpen ? 'Hide' : 'Show'}</Button>
            </div>
          </div>
          <span className="sm:hidden block text-xs text-muted-foreground mb-2">Updated {new Date(summary.created_at).toLocaleString()}</span>
          <div className={execOpen ? '' : 'hidden sm:block'}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Top strengths</h4>
              <ul className="space-y-2">
                {(summary.analysis_result.top_strengths || []).map((it: any, idx: number) => (
                  <li key={`str-${idx}`} className="border rounded-lg p-3">
                    <div className="font-medium">{it.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {it.evidence} {it.page ? <span className="ml-2">(page {it.page})</span> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Top risks</h4>
              <ul className="space-y-2">
                {(summary.analysis_result.top_risks || []).map((it: any, idx: number) => (
                  <li key={`risk-${idx}`} className="border rounded-lg p-3">
                    <div className="font-medium">{it.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {it.evidence} {it.page ? <span className="ml-2">(page {it.page})</span> : null}
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
        <div className="bg-card text-card-foreground border rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold">Due Diligence Signals</h3>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-sm text-muted-foreground">Updated {new Date(ddSignals.created_at).toLocaleString()}</span>
              <Button size="sm" variant="ghost" className="sm:hidden" onClick={()=>setSignalsOpen(v=>!v)}>{signalsOpen ? 'Hide' : 'Show'}</Button>
            </div>
          </div>
          <span className="sm:hidden block text-xs text-muted-foreground mb-2">Updated {new Date(ddSignals.created_at).toLocaleString()}</span>
          <div className={signalsOpen ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4'}>
            {Object.entries(ddSignals.analysis_result).filter(([k])=>k!=="deal_id").map(([k, v]: any)=>{
              const status = v?.status as string;
              const color = status === 'pass' ? 'bg-green-100 text-green-700' : status === 'caution' ? 'bg-yellow-100 text-yellow-700' : status === 'fail' ? 'bg-red-100 text-red-700' : 'bg-muted text-foreground/70';
              const formatSignalValue = (name: string, value: any) => {
                if (typeof value !== 'number') return null;
                if (name === 'working_capital_ccc') return `${Math.round(value)} days`;
                if (name === 'current_ratio' || name === 'dscr_proxy') return `${value.toFixed(2)}x`;
                if (name === 'seasonality' || name === 'accrual_vs_cash_delta') return `${(value * 100).toFixed(1)}%`;
                return value.toFixed(3);
              };
              return (
                <div key={k} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      {status === 'pass' && <span aria-hidden>✓</span>}
                      {status === 'caution' && <span aria-hidden>⚠</span>}
                      {(!status || status === 'na') && <span aria-hidden>—</span>}
                      <span>{String(k).replace(/_/g,' ')}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`} aria-label={`Status ${status || 'NA'}`}>{status?.toUpperCase() || 'NA'}</span>
                  </div>
                  {v?.value != null && (
                    <div className="text-xl font-semibold text-foreground">{formatSignalValue(k, v.value)}</div>
                  )}
                  {v?.detail && (
                    <div className="text-xs text-muted-foreground mt-1">{v.detail}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Due Diligence Checklist (LLM) */}
      {ddChecklist && ddChecklist.analysis_result && (
        <div className="bg-card text-card-foreground border rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Due Diligence Checklist</h3>
            <span className="text-sm text-muted-foreground">Updated {new Date(ddChecklist.created_at).toLocaleString()}</span>
          </div>
          {(() => {
            const items = (ddChecklist.analysis_result.items || []) as Array<any>;
            const groups: Record<string, any[]> = { todo: [], in_progress: [], done: [], na: [] };
            items.forEach(it => { if (groups[it.status]) groups[it.status].push(it); });
            const chip = (label: string, count: number, color: string) => (
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>{label}: {count}</span>
            );
            const riskItems = [...groups.todo, ...groups.in_progress].slice(0, 5);
            const oppItems = groups.done.slice(0, 5);
            return (
              <>
                <div className="flex flex-wrap gap-2 mb-4">
                  {chip('To do', groups.todo.length, 'bg-red-100 text-red-700')}
                  {chip('In progress', groups.in_progress.length, 'bg-yellow-100 text-yellow-700')}
                  {chip('Done', groups.done.length, 'bg-green-100 text-green-700')}
                  {chip('N/A', groups.na.length, 'bg-muted text-foreground/70')}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Top risks</h4>
                    <ul className="space-y-2">
                      {riskItems.map((it, idx) => (
                        <li key={`riskc-${idx}`} className="border rounded-lg p-3">
                          <div className="font-medium">{it.label}</div>
                          {it.notes && <div className="text-xs text-muted-foreground mt-1">{it.notes}</div>}
                        </li>
                      ))}
                      {riskItems.length === 0 && <div className="text-sm text-muted-foreground">No immediate risks identified.</div>}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Top opportunities</h4>
                    <ul className="space-y-2">
                      {oppItems.map((it, idx) => (
                        <li key={`oppc-${idx}`} className="border rounded-lg p-3">
                          <div className="font-medium">{it.label}</div>
                          {it.notes && <div className="text-xs text-muted-foreground mt-1">{it.notes}</div>}
                        </li>
                      ))}
                      {oppItems.length === 0 && <div className="text-sm text-muted-foreground">No completed items yet.</div>}
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
          <div className="bg-card text-card-foreground border rounded-lg p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold">Document Inventory</h3>
                <button
                  className="text-xs text-muted-foreground underline underline-offset-2"
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
              <div className="text-sm text-muted-foreground mb-4">
                Ensures you have the minimum financial statements needed to compute metrics and run diligence. Missing items often block ratio analysis, cohort views, and cash conversion calculations.
              </div>
            )}
            {/* Summary strip */}
            <div className="space-y-3 mb-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Completion</span>
                  <span className="text-muted-foreground">{presentCount}/{expectedCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success">present: {presentCount}</Badge>
                  <Badge variant="destructive">missing: {missingCount}</Badge>
                  <Badge variant="muted">periodicity: {periodicitySummary}</Badge>
                </div>
              </div>
              <div className="h-3 w-full bg-muted/30 rounded">
                <div
                  className={`h-3 rounded transition-all duration-300 ${completionPct >= 80 ? 'bg-green-500' : completionPct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${completionPct}%` }}
                />
              </div>
              <div className="text-right text-xs text-muted-foreground">{completionPct}%</div>
            </div>
            <div className={inventoryOpen ? '' : 'hidden sm:block'}>
            {/* Details toggle */}
            <div className="flex items-center justify-end mb-2">
              <Button size="sm" variant="ghost" onClick={() => setShowInventoryDetails((v) => !v)}>
                {showInventoryDetails ? 'Hide details' : 'Show details'}
              </Button>
            </div>
            {showInventoryDetails && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-3">
                    <div className="text-sm text-muted-foreground mb-2">Expected</div>
                    <div className="flex flex-wrap gap-2">
                      {expected.map((x: string) => (
                        <Badge key={`exp-${x}`} variant="muted">{x.replace(/_/g,' ')}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="text-sm text-muted-foreground mb-2">Present</div>
                    <div className="flex flex-wrap gap-2">
                      {present.map((x: string) => (
                        <Badge key={`pre-${x}`} variant="success">{x.replace(/_/g,' ')}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="text-sm text-muted-foreground mb-2">Missing</div>
                    <div className="flex flex-wrap gap-2">
                      {missing.map((x: string) => (
                        <Badge key={`mis-${x}`} variant="destructive">{x.replace(/_/g,' ')}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                {Object.keys(cov).length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(cov).map(([k, v]: any) => (
                      <div key={`cov-${k}`} className="border rounded-lg p-3">
                        <div className="text-sm font-medium mb-1">{String(k).replace(/_/g,' ')}</div>
                        <div className="text-xs text-muted-foreground">{v?.periods ?? '—'} periods over {v?.years ?? '—'} years</div>
                        <div className="text-xs text-muted-foreground">periodicity: {v?.periodicity ?? '—'}</div>
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

      
    </div>
  );
};

const EnhancedReportTab = ({ deal, refreshKey }: { deal: any; refreshKey: number }) => {
  const userId = 'user_123';
  const { 
    report, 
    reports, 
    summaryReport,
    isLoading, 
    isGenerating, 
    error, 
    generateReport, 
    generationStatus,
    pollGenerationStatus 
  } = useAnalysisReport({ 
    dealId: deal.id, 
    autoFetch: true 
  });

  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [reportType, setReportType] = useState<'comprehensive' | 'financial_summary' | 'risk_assessment' | 'due_diligence'>('comprehensive');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [generationMessage, setGenerationMessage] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    const request = {
      deal_id: deal.id,
      report_type: reportType,
      title: `${deal.title} - ${reportType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Report`,
      description: `Enhanced ${reportType.replace('_', ' ')} analysis for ${deal.title}`,
      include_evidence: true,
      include_qa: true,
      export_formats: ['pdf' as const, 'docx' as const],
      generated_by: userId
    };

    try {
      setIsGeneratingReport(true);
      setGenerationMessage('Starting report generation...');
      
      const result = await generateReport(request);
      if (result?.success) {
        setGenerationMessage('Report generation started successfully! Check the reports tab for progress.');
        setTimeout(() => {
          setShowGenerateForm(false);
          setGenerationMessage(null);
        }, 3000);
        console.log('Report generation started successfully:', result);
      } else {
        const errorMsg = result?.error || 'Unknown error';
        setGenerationMessage(`Failed to start report generation: ${errorMsg}`);
        console.error('Failed to start report generation:', result);
        console.error('Full error details:', {
          result,
          request,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setGenerationMessage(`Error: ${errorMessage}`);
      console.error('Error generating report:', error);
      console.error('Full error details:', {
        error,
        request,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Mock data for demonstration - in real app this would come from the report
  const mockData = {
    healthScore: 75,
    trafficLights: {
      revenue_cagr_3y: 'green' as const,
      gross_margin: 'green' as const,
      net_margin: 'yellow' as const,
      current_ratio: 'green' as const,
      debt_to_equity: 'red' as const,
      working_capital: 'yellow' as const
    },
    strengths: [
      {
        title: 'Strong Revenue Growth',
        description: 'Revenue CAGR of 15% over the last 3 years, well above industry average',
        impact: 'high' as const,
        evidence: [
          {
            type: 'metric' as const,
            ref: 'revenue_cagr_3y',
            confidence: 0.9,
            context: 'Revenue CAGR of 15% over the last 3 years'
          }
        ]
      },
      {
        title: 'Healthy Gross Margins',
        description: 'Gross margins maintained at 45-50% range, indicating strong pricing power',
        impact: 'high' as const,
        evidence: [
          {
            type: 'metric' as const,
            ref: 'gross_margin',
            confidence: 0.85,
            context: 'Gross margins maintained at 45-50% range'
          }
        ]
      }
    ],
    risks: [
      {
        title: 'High Debt Levels',
        description: 'Debt-to-equity ratio of 2.5x exceeds industry benchmark of 1.5x',
        impact: 'high' as const,
        evidence: [
          {
            type: 'metric' as const,
            ref: 'debt_to_equity',
            confidence: 0.95,
            context: 'Debt-to-equity ratio of 2.5x exceeds industry benchmark'
          }
        ]
      },
      {
        title: 'Declining Net Margins',
        description: 'Net margins decreased from 12% to 8% over the last 2 years',
        impact: 'medium' as const,
        evidence: [
          {
            type: 'metric' as const,
            ref: 'net_margin',
            confidence: 0.8,
            context: 'Net margins decreased from 12% to 8% over the last 2 years'
          }
        ]
      }
    ],
    recommendation: {
      decision: 'Caution' as const,
      confidence: 0.75,
      rationale: 'While the company shows strong revenue growth and healthy gross margins, the high debt levels and declining net margins pose significant risks that require careful consideration before proceeding.',
      key_factors: [
        'High debt-to-equity ratio exceeds industry benchmarks',
        'Declining net margins indicate operational challenges',
        'Strong revenue growth provides some offset to risks'
      ]
    },
    rationale: 'While the company shows strong revenue growth and healthy gross margins, the high debt levels and declining net margins pose significant risks that require careful consideration before proceeding.'
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading enhanced report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">Error loading report: {error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  // If no report is available yet, show a message instead of an error
  if (!summaryReport && !isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="text-muted-foreground mb-4">
          <p className="text-lg mb-2">No analysis report available yet</p>
          <p className="text-sm">Upload financial documents and run an analysis to generate your first report.</p>
        </div>
        <Button 
          onClick={() => setShowGenerateForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Generate Report
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Generate Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Enhanced Financial Report</h3>
          <p className="text-sm text-muted-foreground">
            Comprehensive analysis with evidence tracking and AI-powered insights
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {generationStatus && (
            <div className="text-sm text-muted-foreground">
              {generationStatus.status === 'queued' && 'Queued for generation...'}
              {generationStatus.status === 'processing' && `Processing... ${generationStatus.progress}%`}
              {generationStatus.status === 'completed' && 'Report ready!'}
              {generationStatus.status === 'failed' && 'Generation failed'}
            </div>
          )}
          
          <Button 
            onClick={() => setShowGenerateForm(!showGenerateForm)}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      </div>

      {/* Generate Report Form */}
      {showGenerateForm && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-3">Generate New Report</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-full p-2 border border-blue-300 rounded-md text-sm"
              >
                <option value="comprehensive">Comprehensive Analysis</option>
                <option value="financial_summary">Financial Summary</option>
                <option value="risk_assessment">Risk Assessment</option>
                <option value="due_diligence">Due Diligence</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="w-full"
              >
                {isGeneratingReport ? 'Generating...' : 'Start Generation'}
              </Button>
            </div>
          </div>
          
          {/* Generation Status Messages */}
          {generationMessage && (
            <div className={`p-3 rounded-md text-sm ${
              generationMessage.includes('Error') || generationMessage.includes('Failed') 
                ? 'bg-red-100 text-red-800 border border-red-200' 
                : 'bg-green-100 text-green-800 border border-green-200'
            }`}>
              {generationMessage}
            </div>
          )}
        </div>
      )}

      {/* Report Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Score */}
        <div className="lg:col-span-2">
          <HealthScore 
            healthScore={{
              overall: mockData.healthScore,
              components: {
                profitability: 80,
                growth: 85,
                liquidity: 70,
                leverage: 40,
                efficiency: 75,
                data_quality: 90
              },
              methodology: 'Weighted average of financial health indicators'
            }}
            size="lg" 
          />
        </div>

        {/* Traffic Lights */}
        <div className="lg:col-span-2">
          <TrafficLights 
            trafficLights={{
              revenue_quality: {
                status: 'green',
                score: 85,
                reasoning: 'Strong revenue growth with consistent patterns',
                evidence: [{ type: 'metric', ref: 'revenue_cagr_3y', confidence: 0.9 }]
              },
              margin_trends: {
                status: 'yellow',
                score: 65,
                reasoning: 'Gross margins strong but net margins declining',
                evidence: [{ type: 'metric', ref: 'gross_margin', confidence: 0.85 }]
              },
              liquidity: {
                status: 'green',
                score: 80,
                reasoning: 'Healthy current ratio and working capital',
                evidence: [{ type: 'metric', ref: 'current_ratio', confidence: 0.8 }]
              },
              leverage: {
                status: 'red',
                score: 35,
                reasoning: 'High debt-to-equity ratio exceeds benchmarks',
                evidence: [{ type: 'metric', ref: 'debt_to_equity', confidence: 0.95 }]
              },
              working_capital: {
                status: 'yellow',
                score: 60,
                reasoning: 'Working capital adequate but could be optimized',
                evidence: [{ type: 'metric', ref: 'working_capital', confidence: 0.7 }]
              },
              data_quality: {
                status: 'green',
                score: 90,
                reasoning: 'Comprehensive financial data with good coverage',
                evidence: [{ type: 'metric', ref: 'data_quality', confidence: 0.9 }]
              }
            }}
          />
        </div>

        {/* Strengths and Risks */}
        <div className="lg:col-span-2">
          <StrengthsRisks 
            strengths={mockData.strengths}
            risks={mockData.risks}
          />
        </div>

        {/* Recommendation */}
        <div className="lg:col-span-2">
          <Recommendation 
            recommendation={mockData.recommendation}
          />
        </div>
      </div>

      {/* Report Actions */}
      <div className="flex items-center justify-center space-x-4 pt-6 border-t border-gray-200">
        <Button variant="outline">
          Download PDF Report
        </Button>
        <Button variant="outline">
          Export to Excel
        </Button>
        <Button variant="outline">
          Share Report
        </Button>
        <Button variant="outline">
          Schedule Review Meeting
        </Button>
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
  const [rateLimitCooldown, setRateLimitCooldown] = useState(0);

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

  // Handle rate limit cooldown countdown
  useEffect(() => {
    if (rateLimitCooldown > 0) {
      const timer = setTimeout(() => {
        setRateLimitCooldown(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [rateLimitCooldown]);

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

  // Extract summary data for AppShell
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

  const healthScore = summary?.analysis_result?.health_score;
  const recommendation = summary?.analysis_result?.recommendation;
  const computedMetrics = financial?.analysis_result?.metrics || {};

  return (
    <AppShell
      dealName={deal.title}
      healthScore={healthScore}
      recommendation={recommendation}
      dealId={deal.id}
      summaryReport={summary?.analysis_result}
      computedMetrics={computedMetrics}
      onUploadClick={() => setShowUploadOnly(true)}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBackToDeals}>← Back to Deals</Button>
            <div>
              {deal.description && <p className="text-muted-foreground">{deal.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
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
                  if (!res.ok) {
                    const errorData = await res.json().catch(() => ({ error: 'Unknown error occurred' }));
                    throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
                  }
                  setAnalysisRefresh((x) => x + 1);
                  setShowUploadOnly(false); // navigate to overview state
                } catch (e) {
                  const errorMessage = e instanceof Error ? e.message : 'Unknown error';
                  // Check if it's a rate limit error
                  if (errorMessage.includes('Rate limit exceeded') || errorMessage.includes('once per minute')) {
                    // Extract retryAfter from the error message if available
                    const retryMatch = errorMessage.match(/(\d+) seconds/);
                    if (retryMatch) {
                      const retryAfter = parseInt(retryMatch[1]);
                      setRateLimitCooldown(retryAfter);
                    }
                    alert(`Rate limit exceeded: Please wait before analyzing this deal again. ${errorMessage}`);
                  } else {
                    alert(`Analyze failed: ${errorMessage}`);
                  }
                } finally {
                  setAnalyzing(false);
                }
              }}
              disabled={analyzing || rateLimitCooldown > 0}
            >
              {analyzing ? 'Analyzing…' : 
               rateLimitCooldown > 0 ? `Wait ${rateLimitCooldown}s` : 'Analyze'}
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
          <div className="space-y-6">
            {/* Results Header - Most Important Info First */}
            <ResultsHeader 
              summaryReport={summary?.analysis_result}
              isLoading={analyzing}
              error={null}
            />
            
            {/* Summary Tab */}
            <div className="bg-card text-card-foreground border rounded-lg shadow-sm">
              <div className="p-6">
                <SummaryTab key={analysisRefresh} deal={deal} refreshKey={analysisRefresh} />
              </div>
            </div>
            
            {/* Enhanced Report Tab */}
            <div className="bg-card text-card-foreground border rounded-lg shadow-sm">
              <div className="p-6">
                <EnhancedReportTab key={analysisRefresh} deal={deal} refreshKey={analysisRefresh} />
              </div>
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
                      if (!res.ok && res.status !== 204) {
                        const errorData = await res.json().catch(() => ({ error: 'Unknown error occurred' }));
                        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
                      }
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
    </AppShell>
  );
}
