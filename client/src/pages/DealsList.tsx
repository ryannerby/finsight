import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileDropzone } from '@/components/ui/file-dropzone';
import { useFileUpload } from '@/hooks/useFileUpload';
import { UploadProgress } from '@/components/UploadProgress';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { SaveDealButton } from '@/components/SaveDealButton';

const API_BASE_URL = 'http://localhost:3001/api';

export default function DealsList() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const userId = 'user_123';
  const { uploadFiles, isUploading, uploads, clearUploads, removeUpload } = useFileUpload();

  // Create deal form state
  const [showCreate, setShowCreate] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);
  const [createdDealId, setCreatedDealId] = useState<string | null>(null);

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

  // Open or close inline create form when query parameter changes
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setShowCreate(params.get('create') === '1');
  }, [location.search]);

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (createdDealId) {
      navigate(`/deals/${createdDealId}`);
      return;
    }
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
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">

        {showCreate && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">New Deal</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-3 text-sm text-destructive">{error}</div>
              )}
              <form onSubmit={handleCreateDeal} className="space-y-4">
                <div>
                  <Label htmlFor="deal-title" className="mb-1 block">Title</Label>
                  <Input
                    id="deal-title"
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g., TechCorp Acquisition"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="deal-company" className="mb-1 block">Company</Label>
                  <Input
                    id="deal-company"
                    type="text"
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <Label htmlFor="deal-description" className="mb-1 block">Description</Label>
                  <Textarea
                    id="deal-description"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={3}
                    placeholder="Brief description"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Initial Documents (optional)</Label>
                  <FileDropzone
                    onFilesSelected={async (files) => {
                      setSelectedFiles(files);
                      setError(null);
                      if (!formTitle.trim()) {
                        setError('Please enter a deal title before adding documents');
                        return;
                      }
                      try {
                        let dealId = createdDealId;
                        if (!dealId) {
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
                          setDeals((prev) => [deal, ...prev]);
                          setCreatedDealId(deal.id);
                          dealId = deal.id;
                        }
                        await uploadFiles(files, dealId!, userId);
                        // Stay on this page; user can click "View Deal" to navigate when ready
                      } catch (err) {
                        setError(err instanceof Error ? err.message : 'Failed to upload documents');
                      }
                    }}
                    multiple
                    maxFileSize={10}
                  />
                </div>

                {/* Upload progress (mirrors deal detail) */}
                <div className="mt-4">
                  <UploadProgress
                    uploads={uploads}
                    onRemove={removeUpload}
                    onClear={clearUploads}
                  />
                </div>

                <div className="flex gap-3 mt-4">
                  <Button type="submit" disabled={isUploading}>
                    {createdDealId ? 'View Deal' : (isUploading ? 'Creating…' : 'Create Deal')}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {confirmDelete && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-card text-card-foreground border rounded-lg p-6 w-full max-w-md shadow-xl">
              <h3 className="text-lg font-semibold mb-2">Delete Deal</h3>
              <p className="text-muted-foreground mb-4">
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
          <div className="mb-4">
            <div className="flex items-center gap-2 p-2 rounded-md border border-destructive/30 bg-destructive/5 text-destructive text-sm">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}
        {loading && (
          <div className="grid gap-4 mb-4">
            {[1,2,3].map((i)=> (
              <div key={i} className="rounded-2xl border shadow-sm p-4 animate-pulse bg-foreground/5 h-24" />
            ))}
          </div>
        )}
        <div className="grid gap-3">
          {deals.map((deal: any) => (
            <Card 
              key={deal.id} 
              className="cursor-pointer hover:shadow-md transition-shadow rounded-2xl"
              onClick={() => handleDealClick(deal.id)}
            >
              <CardHeader className="p-4 pb-3">
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <div className="text-title truncate">{deal.title}</div>
                    {deal.description && (() => {
                      const first = String(deal.description).split('|')[0]?.trim();
                      return first ? (
                        <div className="text-sm text-muted-foreground truncate">{first}</div>
                      ) : null;
                    })()}
                  </div>
                  <div className="flex items-center gap-3 text-caption text-muted-foreground">
                    <SaveDealButton
                      dealId={deal.id}
                      isSaved={deal.is_saved || false}
                      onSaveChange={(isSaved) => {
                        setDeals(prev => prev.map(d => 
                          d.id === deal.id ? { ...d, is_saved: isSaved } : d
                        ));
                      }}
                    />
                    {(() => {
                      const docs = (Array.isArray(deal.documents) ? deal.documents : []);
                      const count = typeof deal.documents_count === 'number'
                        ? deal.documents_count
                        : (Array.isArray(docs) && docs[0] && typeof docs[0].count === 'number')
                          ? docs[0].count
                          : (Array.isArray(docs) ? docs.length : 0);
                      return (
                        <Badge variant="secondary" className="px-2 py-0.5">{count} doc{count === 1 ? '' : 's'}</Badge>
                      );
                    })()}
                    <div className="flex items-center gap-1" aria-label={`Created ${new Date(deal.created_at).toLocaleString()}`}>
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span>{new Date(deal.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {deals.length === 0 && (
          <EmptyState
            title="No deals found"
            helper="Seed sample data with the server seed script or create a new deal."
            action={<Button onClick={()=>setShowCreate(true)}>Create Deal</Button>}
          />
        )}
      </div>
    </div>
  );
}
