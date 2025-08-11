// React import not needed with modern JSX transform
import { Button } from './ui/button';
import { UploadedFile } from '../hooks/useFileUpload';

const API_BASE_URL = 'http://localhost:3001/api';

interface FileListProps {
  files: UploadedFile[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export function FileList({ files, loading, error, onRefresh }: FileListProps) {
  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) {
      return { icon: 'PDF', color: 'bg-red-100 text-red-600' };
    } else if (mimeType.includes('csv')) {
      return { icon: 'CSV', color: 'bg-green-100 text-green-600' };
    } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
      return { icon: 'XLS', color: 'bg-blue-100 text-blue-600' };
    } else if (mimeType.includes('document')) {
      return { icon: 'DOC', color: 'bg-blue-100 text-blue-600' };
    } else {
      return { icon: 'FILE', color: 'bg-gray-100 text-gray-600' };
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  const getFileTypeLabel = (fileType: string) => {
    switch (fileType) {
      case 'P&L':
        return 'P&L Statement';
      case 'balance_sheet':
        return 'Balance Sheet';
      case 'cash_flow':
        return 'Cash Flow';
      case 'financial':
        return 'Financial Document';
      case 'legal':
        return 'Legal Document';
      case 'technical':
        return 'Technical Document';
      default:
        return 'Document';
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <div className="space-y-1">
                <div className="h-4 bg-gray-200 rounded w-48"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex justify-between items-center">
          <p className="text-sm text-red-600">{error}</p>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-2">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-500">No files uploaded yet</p>
        <p className="text-sm text-gray-400">Upload some documents to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {files.map((file) => {
        const { icon, color } = getFileTypeIcon(file.mime_type);
        const hasAnalysis = file.analyses && file.analyses.length > 0;
        
        return (
          <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center space-x-3 flex-1">
              <div className={`w-8 h-8 rounded flex items-center justify-center ${color}`}>
                <span className="text-xs font-semibold">{icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-900 truncate">{file.original_name}</p>
                  {file.file_type && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getFileTypeLabel(file.file_type)}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{formatFileSize(file.file_size)}</span>
                  <span>•</span>
                  <span>{formatDate(file.uploaded_at)}</span>
                  {hasAnalysis && (
                    <>
                      <span>•</span>
                      <span className="text-green-600 font-medium">✓ Parsed</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {hasAnalysis && (
                <Button variant="ghost" size="sm">
                  View Analysis
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  try {
                    const params = new URLSearchParams({ user_id: 'user_123' });
                    const resp = await fetch(`${API_BASE_URL}/files/download/${file.id}?${params}`);
                    if (!resp.ok) throw new Error('Failed to get download URL');
                    const { url } = await resp.json();
                    window.open(url, '_blank');
                  } catch (e) {
                    alert('Download failed');
                  }
                }}
              >
                Download
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}