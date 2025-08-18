import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';

interface SaveDealButtonProps {
  dealId: string;
  isSaved: boolean;
  onSaveChange: (isSaved: boolean) => void;
  className?: string;
}

const API_BASE_URL = 'http://localhost:3001/api';

export const SaveDealButton: React.FC<SaveDealButtonProps> = ({
  dealId,
  isSaved,
  onSaveChange,
  className = ''
}) => {
  const [loading, setLoading] = useState(false);
  const userId = 'user_123'; // Mock user ID - in real app this would come from auth context

  const handleSaveToggle = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/deals/${dealId}/save`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          is_saved: !isSaved
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update save status');
      }

      const updatedDeal = await response.json();
      onSaveChange(updatedDeal.is_saved);
    } catch (error) {
      console.error('Error toggling save status:', error);
      // You might want to show a toast notification here
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isSaved ? "default" : "outline"}
      size="sm"
      onClick={handleSaveToggle}
      disabled={loading}
      className={`gap-2 ${className}`}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isSaved ? (
        <BookmarkCheck className="w-4 h-4" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
      {isSaved ? 'Saved' : 'Save Deal'}
    </Button>
  );
}; 