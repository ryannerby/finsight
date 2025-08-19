import React, { useCallback, useRef, useState, useId } from 'react';
import { Button } from './button';

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in MB
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  loading?: boolean; // Whether to show loading state
}

export function FileDropzone({
  onFilesSelected,
  acceptedFileTypes = ['application/pdf', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  maxFileSize = 10,
  multiple = true,
  disabled = false,
  className = '',
  loading = false
}: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragCounterRef = useRef(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const uid = useId();
  const inputId = `file-upload-${uid}`;

  const validateFile = useCallback((file: File): boolean => {
    // Check file type
    if (acceptedFileTypes.length > 0 && !acceptedFileTypes.includes(file.type)) {
      setError(`File type ${file.type} is not supported. Supported types: PDF, CSV, Excel`);
      return false;
    }

    // Check file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxFileSize) {
      setError(`File size ${fileSizeInMB.toFixed(2)}MB exceeds maximum size of ${maxFileSize}MB`);
      return false;
    }

    return true;
  }, [acceptedFileTypes, maxFileSize]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    
    setError(null);
    const fileArray = Array.from(files);
    
    // Validate all files
    const validFiles = fileArray.filter(validateFile);
    
    if (validFiles.length !== fileArray.length) {
      return; // Error already set by validateFile
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  }, [onFilesSelected, validateFile]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    dragCounterRef.current += 1;
    setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragCounterRef.current > 0) {
      dragCounterRef.current -= 1;
    }
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragOver(false);
    
    if (disabled) return;
    
    handleFiles(e.dataTransfer.files);
  }, [disabled, handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset input so same file can be selected again
    e.target.value = '';
  }, [handleFiles]);

  const getFileTypeText = () => {
    const types = [];
    if (acceptedFileTypes.includes('application/pdf')) types.push('PDF');
    if (acceptedFileTypes.includes('text/csv')) types.push('CSV');
    if (acceptedFileTypes.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) types.push('Excel');
    return types.length > 0 ? types.join(', ') : 'All files';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => { if (!disabled) inputRef.current?.click(); }}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ease-in-out outline-none
          ${isDragOver && !disabled
            ? 'border-[hsl(var(--primary))] bg-[hsl(var(--secondary))]/20 ring-2 ring-[hsl(var(--primary))]/40 scale-[1.01]'
            : 'border-[hsl(var(--secondary))]/60 hover:border-[hsl(var(--secondary))] hover:scale-[1.005] hover:shadow-sm'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <div className="space-y-4">
          <div className="text-foreground/60">
            {loading ? (
              <div className="mx-auto h-12 w-12 bg-muted rounded animate-pulse" />
            ) : (
              <svg className="mx-auto h-12 w-12 transition-transform duration-200 ease-in-out hover:scale-110" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path 
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                  strokeWidth={2} 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
            )}
          </div>
          <div>
            <p className="text-lg text-foreground/70">
              {isDragOver ? 'Drop files here' : 'Drop files here or click to upload'}
            </p>
            <p className="text-sm text-foreground/60">
              Supports {getFileTypeText()} files up to {maxFileSize}MB
            </p>
          </div>
          <div>
            <input
              ref={inputRef}
              type="file"
              multiple={multiple}
              accept={acceptedFileTypes.join(',')}
              onChange={handleFileInput}
              disabled={disabled}
              className="hidden"
              id={inputId}
            />
            <label htmlFor={inputId} className="cursor-pointer">
                          <Button 
              type="button"
              variant="outline" 
              disabled={disabled || loading}
              className="cursor-pointer"
              onClick={() => inputRef.current?.click()}
            >
              {loading ? 'Processing...' : 'Choose Files'}
            </Button>
            </label>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-black/5 border border-black/10 rounded-lg">
          <p className="text-sm text-black">{error}</p>
        </div>
      )}
    </div>
  );
}