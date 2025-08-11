// React import not needed with modern JSX transform
import { Button } from './ui/button';
import { UploadProgress as UploadProgressType } from '../hooks/useFileUpload';

interface UploadProgressProps {
  uploads: UploadProgressType[];
  onRemove?: (index: number) => void;
  onClear?: () => void;
}

export function UploadProgress({ uploads, onRemove, onClear }: UploadProgressProps) {
  if (uploads.length === 0) return null;

  const getStatusColor = (status: UploadProgressType['status']) => {
    switch (status) {
      case 'uploading':
        return 'bg-blue-500';
      case 'processing':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: UploadProgressType['status']) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'Processing...';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const getStatusIcon = (status: UploadProgressType['status']) => {
    switch (status) {
      case 'uploading':
        return (
          <svg className="animate-spin h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      case 'processing':
        return (
          <svg className="animate-pulse h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'completed':
        return (
          <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  const completedCount = uploads.filter(u => u.status === 'completed').length;
  const errorCount = uploads.filter(u => u.status === 'error').length;
  const inProgressCount = uploads.filter(u => u.status === 'uploading' || u.status === 'processing').length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {completedCount > 0 && <span className="text-green-600">{completedCount} completed</span>}
          {errorCount > 0 && (
            <>
              {completedCount > 0 && <span className="mx-2">•</span>}
              <span className="text-red-600">{errorCount} failed</span>
            </>
          )}
          {inProgressCount > 0 && (
            <>
              {(completedCount > 0 || errorCount > 0) && <span className="mx-2">•</span>}
              <span className="text-blue-600">{inProgressCount} in progress</span>
            </>
          )}
        </div>
        {onClear && (completedCount > 0 || errorCount > 0) && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear All
          </Button>
        )}
      </div>

      {/* Upload items */}
      <div className="space-y-3">
        {uploads.map((upload, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                {getStatusIcon(upload.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {upload.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  {getStatusText(upload.status)}
                </span>
                {onRemove && (upload.status === 'completed' || upload.status === 'error') && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onRemove(index)}
                    className="h-6 w-6 p-0"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                )}
              </div>
            </div>

            {/* Progress bar */}
            {(upload.status === 'uploading' || upload.status === 'processing') && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getStatusColor(upload.status)}`}
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
            )}

            {/* Error message */}
            {upload.status === 'error' && upload.error && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                {upload.error}
              </div>
            )}

            {/* Success info */}
            {upload.status === 'completed' && upload.uploadedFile && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                File uploaded successfully
                {upload.uploadedFile.analyses && upload.uploadedFile.analyses.length > 0 && (
                  <span> and parsed</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}