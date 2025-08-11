import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileDropzone } from '@/components/ui/file-dropzone';
import { useFileUpload } from '@/hooks/useFileUpload';

const API_BASE_URL = 'http://localhost:3001/api';

export default function DealsList() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const userId = 'user_123';
  const { uploadFiles, isUploading } = useFileUpload();

  // Create deal form state
  const [showCreate, setShowCreate] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);

  const handleDealClick = (dealId: string) => {
    navigate(`/deals/${dealId}`);
  };

  // Back to Home uses SafeNavigationButton for robust navigation

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/deals?user_id=${userId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        setDeals(data);
      })
      .catch((e) => setError(e.message || 'Failed to fetch deals'))
      .finally(() => setLoading(false));
  }, []);

  // If header requests creating a deal (?create=1), open the form
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('create') === '1') {
      setShowCreate(true);
    }
  }, []);

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formTitle.trim()) {
      setError('Please enter a deal title');
      return;
    }
    try {
      const description = [formCompany && `Company: ${formCompany}`, formDescription]
        .filter(Boolean)
        .join(' | ');
      const res = await fetch(`${API_BASE_URL}/deals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: formTitle.trim(), description, user_id: userId })
      });
      if (!res.ok) throw new Error(await res.text());
      const deal = await res.json();

      // Upload any selected files to the new deal
      if (selectedFiles.length > 0) {
        await uploadFiles(selectedFiles, deal.id, userId);
      }

      // Reset form
      setFormTitle('');
      setFormCompany('');
      setFormDescription('');
      setSelectedFiles([]);
      setShowCreate(false);

      // Update list and navigate
      setDeals((prev) => [deal, ...prev]);
      navigate(`/deals/${deal.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create deal');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              📊 Finsight Deals
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and track your financial deals with intelligent insights
            </p>
          </div>
        </div>

        {showCreate && (
          <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">New Deal</h2>
            {error && (
              <div className="mb-3 text-sm text-red-600">{error}</div>
            )}
            <form onSubmit={handleCreateDeal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., TechCorp Acquisition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Brief description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Initial Documents (optional)</label>
                <FileDropzone
                  onFilesSelected={(files) => setSelectedFiles(files)}
                  multiple
                  maxFileSize={10}
                />
                {selectedFiles.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">{selectedFiles.length} file(s) selected</div>
                )}
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={isUploading} className="bg-blue-600 hover:bg-blue-700">
                  {isUploading ? 'Creating…' : 'Create Deal'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        {confirmDelete && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
              <h3 className="text-lg font-semibold mb-2">Delete Deal</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete "{confirmDelete.title}"? This will remove associated documents and cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    try {
                      const res = await fetch(`${API_BASE_URL}/deals/${confirmDelete.id}?user_id=${userId}`, { method: 'DELETE' });
                      if (!res.ok && res.status !== 204) throw new Error(await res.text());
                      setDeals((prev) => prev.filter((d) => d.id !== confirmDelete.id));
                      setConfirmDelete(null);
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

        {error && (
          <div className="text-red-600 mb-4">{error}</div>
        )}
        {loading && (
          <div className="text-gray-600 mb-4">Loading deals…</div>
        )}
        <div className="grid gap-6">
          {deals.map((deal: any) => (
            <Card 
              key={deal.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleDealClick(deal.id)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{deal.title}</CardTitle>
                    {deal.description && (
                      <CardDescription className="text-base">
                        {deal.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    {(() => {
                      const docs = (Array.isArray(deal.documents) ? deal.documents : []);
                      const count = typeof deal.documents_count === 'number'
                        ? deal.documents_count
                        : (Array.isArray(docs) && docs[0] && typeof docs[0].count === 'number')
                          ? docs[0].count
                          : (Array.isArray(docs) ? docs.length : 0);
                      return (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                          {count} doc{count === 1 ? '' : 's'}
                        </span>
                      );
                    })()}
                    <span>{new Date(deal.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {deal.description && (
                  <p className="text-gray-600 mb-2">{deal.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {deals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No deals found</p>
            <p className="text-gray-400">Seed data with npm run seed in the server folder</p>
          </div>
        )}
      </div>
    </div>
  );
}
