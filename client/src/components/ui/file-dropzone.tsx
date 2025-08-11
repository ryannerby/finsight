import React, { useCallback, useState } from 'react';
import { Button } from './button';

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in MB
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}

export function FileDropzone({
  onFilesSelected,
  acceptedFileTypes = ['application/pdf', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  maxFileSize = 10,
  multiple = true,
  disabled = false,
  className = ''
}: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragOver && !disabled 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <div className="space-y-4">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path 
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                strokeWidth={2} 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
          </div>
          <div>
            <p className="text-lg text-gray-600">
              {isDragOver ? 'Drop files here' : 'Drop files here or click to upload'}
            </p>
            <p className="text-sm text-gray-500">
              Supports {getFileTypeText()} files up to {maxFileSize}MB
            </p>
          </div>
          <div>
            <input
              type="file"
              multiple={multiple}
              accept={acceptedFileTypes.join(',')}
              onChange={handleFileInput}
              disabled={disabled}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Button 
                type="button"
                variant="outline" 
                disabled={disabled}
                className="cursor-pointer"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                Choose Files
              </Button>
            </label>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}