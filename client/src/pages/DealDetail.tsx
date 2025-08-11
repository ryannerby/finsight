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

const SummaryTab = ({ deal }: { deal: any }) => {
  return (
    <div className="space-y-8">
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
        <p className="text-gray-600 mb-4">Analysis coming soon. Use the Upload tab to add documents.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Deal Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <p className="text-lg">{deal.title}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
            <p className="text-lg">{new Date(deal.created_at).toLocaleString()}</p>
          </div>
        </div>
        {deal.description && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <p className="text-gray-600 leading-relaxed">{deal.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const QATab = ({ dealId }: { dealId: string }) => {
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
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading…</div>;
  }

  if (error || !deal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Deal Not Found</h2>
            <p className="text-gray-600 mb-4">{error || "The deal you're looking for doesn't exist."}</p>
            <div 
              onClick={handleBackToDeals}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors cursor-pointer text-center"
            >
              Back to Deals
            </div>
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div 
              onClick={handleBackToDeals}
              className="text-blue-600 hover:text-blue-800 cursor-pointer px-4 py-2 rounded-md hover:bg-blue-50 transition-colors"
            >
              ← Back to Deals
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{deal.title}</h1>
              <p className="text-gray-600">{deal.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              Active
            </span>
            <span className="text-sm text-gray-500">
              Created: {new Date(deal.created_at).toLocaleDateString()}
            </span>
            <Button variant="destructive" onClick={() => setConfirmDelete(true)}>Delete Deal</Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
            {activeTab === 'summary' && <SummaryTab deal={deal} />}
            {activeTab === 'qa' && <QATab dealId={deal.id} />}
          </div>
        </div>

        {confirmDelete && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
              <h3 className="text-lg font-semibold mb-2">Delete Deal</h3>
              <p className="text-gray-600 mb-4">
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
