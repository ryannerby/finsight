import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { SaveDealButton } from '@/components/SaveDealButton';
import { Bookmark, ArrowLeft } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3001/api';

export default function SavedDeals() {
  const [savedDeals, setSavedDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const userId = 'user_123';

  const fetchSavedDeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/deals/saved/all?user_id=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch saved deals');
      const data = await response.json();
      setSavedDeals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch saved deals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedDeals();
  }, []);

  const handleDealClick = (dealId: string) => {
    navigate(`/deals/${dealId}`);
  };

  const handleSaveChange = (dealId: string, isSaved: boolean) => {
    if (!isSaved) {
      // Remove from the list if unsaved
      setSavedDeals(prev => prev.filter(deal => deal.id !== dealId));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading saved deals...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/deals')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Deals
        </Button>
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold">Saved Deals</h1>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          {error}
        </div>
      )}

      {savedDeals.length === 0 && !loading ? (
        <EmptyState
          icon={<Bookmark className="w-12 h-12" />}
          title="No saved deals yet"
          description="Deals you save will appear here for quick access."
          action={
            <Button onClick={() => navigate('/deals')}>
              Browse Deals
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {savedDeals.map((deal) => (
            <Card
              key={deal.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleDealClick(deal.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">
                    {deal.title}
                  </CardTitle>
                  <SaveDealButton
                    dealId={deal.id}
                    isSaved={true}
                    onSaveChange={(isSaved) => handleSaveChange(deal.id, isSaved)}
                    className="flex-shrink-0"
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {deal.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {deal.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Created {formatDate(deal.created_at)}</span>
                  {deal.documents && deal.documents[0] && (
                    <Badge variant="secondary">
                      {deal.documents[0].count} docs
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 