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
                  {metrics[k] == null ? '—' : typeof metrics[k] === 'number' ? metrics[k].toFixed(3) : String(metrics[k])}
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
  const [activeTab, setActiveTab] = useState<'upload' | 'summary' | 'qa'>('upload');
  const [deal, setDeal] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisRefresh, setAnalysisRefresh] = useState(0);

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

  const tabs = [
    { id: 'upload', label: 'Upload', icon: '📁' },
    { id: 'summary', label: 'Summary', icon: '📊' },
    { id: 'qa', label: 'Q&A', icon: '💬' }
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
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
                  setActiveTab('summary');
                  setAnalysisRefresh((x) => x + 1);
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

        <div className="bg-card text-card-foreground border rounded-lg shadow-sm">
          <div className="border-b">
            <nav className="flex gap-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'upload' && <UploadTab dealId={deal.id} />}
            {activeTab === 'summary' && <SummaryTab key={analysisRefresh} deal={deal} refreshKey={analysisRefresh} />}
            {activeTab === 'qa' && <QATab />}
          </div>
        </div>
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
