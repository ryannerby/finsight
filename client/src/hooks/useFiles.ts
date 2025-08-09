import { useState, useEffect, useCallback } from 'react';
import { UploadedFile } from './useFileUpload';

const API_BASE_URL = 'http://localhost:3001/api';

export function useFiles(dealId: string | undefined, userId: string) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    if (!dealId || !userId) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/files/deal/${dealId}?user_id=${userId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch files: ${response.statusText}`);
      }

      const data = await response.json();
      setFiles(data);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  }, [dealId, userId]);

  // Fetch files when component mounts or dependencies change
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const refreshFiles = useCallback(() => {
    fetchFiles();
  }, [fetchFiles]);

  return {
    files,
    loading,
    error,
    refreshFiles
  };
}