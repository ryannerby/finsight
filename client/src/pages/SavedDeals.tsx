import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { SaveDealButton } from '@/components/SaveDealButton';
import { Bookmark, ArrowLeft, BarChart3, Check } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3001/api';

export default function SavedDeals() {
  const [savedDeals, setSavedDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
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
      // Also remove from selected deals
      setSelectedDeals(prev => prev.filter(id => id !== dealId));
    }
  };

  const handleDealSelection = (dealId: string) => {
    setSelectedDeals(prev => {
      if (prev.includes(dealId)) {
        return prev.filter(id => id !== dealId);
      } else {
        return [...prev, dealId];
      }
    });
  };

  const handleHeadToHead = () => {
    if (selectedDeals.length >= 2) {
      navigate('/head-to-head', { 
        state: { 
          selectedDealIds: selectedDeals,
          deals: savedDeals.filter(deal => selectedDeals.includes(deal.id))
        } 
      });
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

      {/* Head to Head Button */}
      {selectedDeals.length >= 2 && (
        <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span className="font-medium">
                {selectedDeals.length} deals selected for comparison
              </span>
            </div>
            <Button 
              onClick={handleHeadToHead}
              className="gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Head to Head
            </Button>
          </div>
        </div>
      )}

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
              className={`cursor-pointer hover:shadow-md transition-all ${
                selectedDeals.includes(deal.id) 
                  ? 'ring-2 ring-primary shadow-lg' 
                  : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Selection Checkbox */}
                    <div 
                      className="mt-1 w-5 h-5 rounded border-2 border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDealSelection(deal.id);
                      }}
                    >
                      {selectedDeals.includes(deal.id) && (
                        <Check className="w-3 h-3 text-primary" />
                      )}
                    </div>
                    <CardTitle 
                      className="text-lg line-clamp-2 flex-1"
                      onClick={() => handleDealClick(deal.id)}
                    >
                      {deal.title}
                    </CardTitle>
                  </div>
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
                    {deal.description.includes('[METRICS:') 
                      ? deal.description.split('[METRICS:')[0].trim()
                      : deal.description
                    }
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