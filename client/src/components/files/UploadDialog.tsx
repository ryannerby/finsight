import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileDropzone } from '@/components/ui/file-dropzone';
import { UploadProgress } from '@/components/UploadProgress';
import { Button } from '@/components/ui/button';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Upload, X } from 'lucide-react';

interface UploadDialogProps {
  dealId: string;
  userId: string;
  onUploadComplete?: () => void;
  children: React.ReactNode;
}

export function UploadDialog({ dealId, userId, onUploadComplete, children }: UploadDialogProps) {
  const [open, setOpen] = useState(false);
  const { uploads, isUploading, uploadFiles, clearUploads, removeUpload } = useFileUpload();

  const handleFilesSelected = async (selectedFiles: File[]) => {
    await uploadFiles(selectedFiles, dealId, userId);
  };

  // Monitor upload completion
  useEffect(() => {
    if (uploads.length > 0 && !isUploading) {
      const allCompleted = uploads.every(upload => upload.status === 'completed');
      if (allCompleted && onUploadComplete) {
        onUploadComplete();
      }
    }
  }, [uploads, isUploading, onUploadComplete]);

  const handleClose = () => {
    if (!isUploading) {
      setOpen(false);
      clearUploads();
    }
  };

  const hasUploads = uploads.length > 0;
  const allCompleted = uploads.length > 0 && uploads.every(upload => upload.status === 'completed');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" aria-hidden="true" />
            Upload Files
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-6">
          {/* File Dropzone */}
          <div>
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

          {/* Upload Progress */}
          {hasUploads && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Upload Progress</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearUploads}
                  disabled={isUploading}
                  className="h-6 px-2 text-xs"
                  aria-label="Clear all uploads"
                >
                  Clear
                </Button>
              </div>
              <UploadProgress
                uploads={uploads}
                onRemove={removeUpload}
                onClear={clearUploads}
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            {hasUploads && allCompleted ? 'Done' : 'Cancel'}
          </Button>
          {hasUploads && allCompleted && (
            <Button
              onClick={handleClose}
              className="gap-2"
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              Files Uploaded
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
