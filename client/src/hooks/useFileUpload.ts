import { useState, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:3001/api';

export interface UploadedFile {
  id: string;
  filename: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  file_type: string;
  uploaded_at: string;
  analyses?: Array<{
    id: string;
    parsed_text?: string;
    analysis_type: string;
    analysis_result?: any;
    created_at: string;
  }>;
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  uploadedFile?: UploadedFile;
}

export function useFileUpload() {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFiles = useCallback(async (files: File[], dealId: string, userId: string) => {
    setIsUploading(true);
    
    // Initialize progress tracking for all files
    const initialUploads: UploadProgress[] = files.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }));
    
    setUploads(initialUploads);

    try {
      // Process files sequentially to avoid overwhelming the server
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          // Step 1: Get pre-signed URL
          const uploadUrlResponse = await fetch(`${API_BASE_URL}/files/upload-url`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              filename: file.name,
              deal_id: dealId,
              user_id: userId
            })
          });

          if (!uploadUrlResponse.ok) {
            throw new Error(`Failed to get upload URL: ${uploadUrlResponse.statusText}`);
          }

          const { uploadUrl, path } = await uploadUrlResponse.json();

          // Update progress
          setUploads(prev => prev.map((upload, index) => 
            index === i ? { ...upload, progress: 25 } : upload
          ));

          // Step 2: Upload file to Supabase Storage
          const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type,
            }
          });

          if (!uploadResponse.ok) {
            throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
          }

          // Update progress
          setUploads(prev => prev.map((upload, index) => 
            index === i ? { ...upload, progress: 50 } : upload
          ));

          // Step 3: Confirm upload and create document record
          const confirmResponse = await fetch(`${API_BASE_URL}/files/confirm-upload`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              deal_id: dealId,
              filename: path.split('/').pop(),
              original_name: file.name,
              file_path: path,
              file_size: file.size,
              mime_type: file.type,
              user_id: userId
            })
          });

          if (!confirmResponse.ok) {
            throw new Error(`Failed to confirm upload: ${confirmResponse.statusText}`);
          }

          const uploadedFile: UploadedFile = await confirmResponse.json();

          // Update progress
          setUploads(prev => prev.map((upload, index) => 
            index === i ? { 
              ...upload, 
              progress: 75, 
              status: 'processing' as const,
              uploadedFile 
            } : upload
          ));

          // Step 4: Parse the document
          const parseResponse = await fetch(`${API_BASE_URL}/files/parse/${uploadedFile.id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: userId
            })
          });

          if (!parseResponse.ok) {
            // Parsing failed, but upload succeeded
            console.warn(`Failed to parse file: ${parseResponse.statusText}`);
            setUploads(prev => prev.map((upload, index) => 
              index === i ? { 
                ...upload, 
                progress: 100, 
                status: 'completed' as const 
              } : upload
            ));
          } else {
            const analysis = await parseResponse.json();
            
            // Update with parsing results
            setUploads(prev => prev.map((upload, index) => 
              index === i ? { 
                ...upload, 
                progress: 100, 
                status: 'completed' as const,
                uploadedFile: {
                  ...uploadedFile,
                  analyses: [analysis]
                }
              } : upload
            ));
          }

        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          setUploads(prev => prev.map((upload, index) => 
            index === i ? { 
              ...upload, 
              status: 'error' as const,
              error: error instanceof Error ? error.message : 'Upload failed'
            } : upload
          ));
        }
      }
    } finally {
      setIsUploading(false);
    }
  }, []);

  const clearUploads = useCallback(() => {
    setUploads([]);
  }, []);

  const removeUpload = useCallback((index: number) => {
    setUploads(prev => prev.filter((_, i) => i !== index));
  }, []);

  return {
    uploads,
    isUploading,
    uploadFiles,
    clearUploads,
    removeUpload
  };
}