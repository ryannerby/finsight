import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileDropzone } from '@/components/ui/file-dropzone';

import { FileList } from '@/components/FileList';
import { UploadProgress } from '@/components/UploadProgress';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useFiles } from '@/hooks/useFiles';

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
  const { files, loading, error, refreshFiles } = useFiles(deal.id, userId);

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

  return (
    <div className="space-y-8">
      <div className="bg-card text-card-foreground border rounded-lg p-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Deal Summary</h3>
          {financial && (
            <span className="text-sm text-muted-foreground">Updated {new Date(financial.created_at).toLocaleString()}</span>
          )}
        </div>
        {!financial && (
          <p className="text-muted-foreground">No analysis yet. Click Analyze on the top right to compute metrics.</p>
        )}
        {financial && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['gross_margin','net_margin','current_ratio','debt_to_equity','revenue_cagr_3y'].map((k) => (
              <div key={k} className="border rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-1">{k.replace(/_/g,' ')}</div>
                <div className="text-xl font-semibold">
                  {metrics[k] == null ? 'n/a' : typeof metrics[k] === 'number' ? formatMetric(k, metrics[k]) : String(metrics[k])}
                </div>
              </div>
            ))}
            <div className="border rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">periodicity</div>
              <div className="text-xl font-semibold">{coverage.periodicity || '—'}</div>
            </div>
          </div>
        )}
      </div>

      {/* Executive summary (LLM) */}
      {summary && summary.analysis_result && (
        <div className="bg-card text-card-foreground border rounded-lg p-6">
          <div className="flex flex-wrap items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Executive Summary</h3>
            <span className="text-sm text-muted-foreground">Updated {new Date(summary.created_at).toLocaleString()}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className={`text-2xl font-bold ${summary.analysis_result.health_score >= 80 ? 'text-green-600' : summary.analysis_result.health_score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              Health score: {Math.round(summary.analysis_result.health_score)}
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${summary.analysis_result.recommendation === 'Proceed' ? 'bg-green-100 text-green-700' : summary.analysis_result.recommendation === 'Caution' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
              {summary.analysis_result.recommendation}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(summary.analysis_result.traffic_lights || {}).map(([k, v]: any) => (
              <span key={k} className={`px-2.5 py-1 rounded-full text-xs font-medium ${v === 'green' ? 'bg-green-100 text-green-700' : v === 'yellow' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                {String(k).replace(/_/g, ' ')}
              </span>
            ))}
          </div>
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
      )}

      {/* Deterministic Due Diligence Signals */}
      {ddSignals && ddSignals.analysis_result && (
        <div className="bg-card text-card-foreground border rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Due Diligence Signals</h3>
            <span className="text-sm text-muted-foreground">Updated {new Date(ddSignals.created_at).toLocaleString()}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(ddSignals.analysis_result).filter(([k])=>k!=="deal_id").map(([k, v]: any)=>{
              const status = v?.status as string;
              const color = status === 'pass' ? 'bg-[hsl(var(--secondary))]/30 text-foreground' : status === 'caution' ? 'bg-[hsl(var(--secondary))]/20 text-foreground/80' : status === 'fail' ? 'bg-black/10 text-black' : 'bg-muted text-foreground/70';
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
                    <div className="text-sm text-muted-foreground">{String(k).replace(/_/g,' ')}</div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{status?.toUpperCase() || 'NA'}</span>
                  </div>
                  {v?.value != null && (
                    <div className="text-xl font-semibold">{formatSignalValue(k, v.value)}</div>
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
                  {chip('To do', groups.todo.length, 'bg-black/10 text-black')}
                  {chip('In progress', groups.in_progress.length, 'bg-[hsl(var(--secondary))]/20 text-foreground/80')}
                  {chip('Done', groups.done.length, 'bg-[hsl(var(--secondary))]/30 text-foreground')}
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

      {/* Document Inventory */}
      {inventory && inventory.analysis_result && (
        <div className="bg-card text-card-foreground border rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Document Inventory</h3>
            <span className="text-sm text-muted-foreground">Updated {new Date(inventory.created_at).toLocaleString()}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-2">Expected</div>
              <div className="flex flex-wrap gap-2">
                {(inventory.analysis_result.expected || []).map((x: string) => (
                  <span key={`exp-${x}`} className="px-2.5 py-1 rounded-full text-xs bg-muted">{x.replace(/_/g,' ')}</span>
                ))}
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-2">Present</div>
              <div className="flex flex-wrap gap-2">
                {(inventory.analysis_result.present || []).map((x: string) => (
                  <span key={`pre-${x}`} className="px-2.5 py-1 rounded-full text-xs bg-[hsl(var(--secondary))]/30 text-foreground">{x.replace(/_/g,' ')}</span>
                ))}
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-2">Missing</div>
              <div className="flex flex-wrap gap-2">
                {(inventory.analysis_result.missing || []).map((x: string) => (
                  <span key={`mis-${x}`} className="px-2.5 py-1 rounded-full text-xs bg-black/10 text-black">{x.replace(/_/g,' ')}</span>
                ))}
              </div>
            </div>
          </div>
          {inventory.analysis_result.coverage && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(inventory.analysis_result.coverage).map(([k, v]: any) => (
                <div key={`cov-${k}`} className="border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">{String(k).replace(/_/g,' ')}</div>
                  <div className="text-sm text-muted-foreground">periods: {v?.periods ?? '—'}</div>
                  <div className="text-sm text-muted-foreground">years: {v?.years ?? '—'}</div>
                  <div className="text-sm text-muted-foreground">periodicity: {v?.periodicity ?? '—'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-card text-card-foreground border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Deal Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Title</label>
            <p className="text-lg">{deal.title}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Created</label>
            <p className="text-lg">{new Date(deal.created_at).toLocaleString()}</p>
          </div>
        </div>
        {deal.description && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
            <p className="text-muted-foreground leading-relaxed">{deal.description}</p>
          </div>
        )}
        {error && <div className="text-destructive mt-3 text-sm">{error}</div>}
        {loading && <div className="text-muted-foreground mt-3 text-sm">Loading latest analyses…</div>}
      </div>
    </div>
  );
};

const QATab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Q&A Section</h3>
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
  const { files, refreshFiles } = useFiles(dealId, userId);
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
