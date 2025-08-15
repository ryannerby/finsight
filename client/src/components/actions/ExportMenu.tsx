import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileSpreadsheet, Share2, Calendar, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { exportService, ExportOptions, ExportProgress } from '../../services/exportService';

interface ExportMenuProps {
  dealId: string;
  summaryReport?: any;
  computedMetrics?: any;
  className?: string;
}

interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export function ExportMenu({ dealId, summaryReport, computedMetrics, className }: ExportMenuProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    theme: 'professional',
    includeCharts: true,
    includeAppendix: false,
    includeRawData: true,
    includeEvidence: true
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleExport = async (format: 'pdf' | 'xlsx') => {
    if (!summaryReport || !computedMetrics) {
      addToast('error', 'Export data not available');
      return;
    }

    try {
      setIsExporting(true);
      setExportProgress(null);

      // Validate export data
      const validation = exportService.validateExportData(dealId, summaryReport, computedMetrics);
      if (!validation.isValid) {
        throw new Error(`Export validation failed: ${validation.errors.join(', ')}`);
      }

      if (format === 'pdf') {
        await exportService.exportToPDF(
          dealId,
          summaryReport,
          computedMetrics,
          exportOptions,
          setExportProgress
        );
        addToast('success', 'PDF exported successfully!');
      } else {
        await exportService.exportToExcel(
          dealId,
          summaryReport,
          computedMetrics,
          exportOptions,
          setExportProgress
        );
        addToast('success', 'Excel file exported successfully!');
      }

      // Show success message briefly
      setTimeout(() => {
        setExportProgress(null);
      }, 2000);

    } catch (error) {
      console.error(`Export to ${format.toUpperCase()} failed:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addToast('error', `Export failed: ${errorMessage}`);
      setExportProgress({
        status: 'error',
        progress: 0,
        message: 'Export failed',
        error: errorMessage
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareLink = async () => {
    try {
      // Generate shareable link (placeholder implementation)
      const shareUrl = `${window.location.origin}/deals/${dealId}/share`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      addToast('success', 'Share link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy share link:', error);
      addToast('error', 'Failed to copy share link');
    }
  };

  const handleScheduleReview = async () => {
    try {
      // Placeholder implementation for scheduling review
      // In a real app, this would open a calendar/scheduling dialog
      addToast('success', 'Review meeting scheduled successfully!');
    } catch (error) {
      console.error('Failed to schedule review:', error);
      addToast('error', 'Failed to schedule review meeting');
    }
  };

  const isExportDisabled = !summaryReport || !computedMetrics || isExporting;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isExportDisabled}
            className={`gap-2 ${className}`}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Export & Share</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={() => handleExport('pdf')}
            disabled={isExportDisabled}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Export PDF
            {exportProgress?.status === 'preparing' && (
              <Badge variant="secondary" className="ml-auto">
                Preparing...
              </Badge>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={() => handleExport('xlsx')}
            disabled={isExportDisabled}
            className="gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
            {exportProgress?.status === 'preparing' && (
              <Badge variant="secondary" className="ml-auto">
                Preparing...
              </Badge>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={handleShareLink}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share link
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={handleScheduleReview}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            Schedule review
          </DropdownMenuItem>
          
          {exportProgress?.status === 'error' && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-sm text-destructive">
                {exportProgress.error}
              </div>
            </>
          )}
          
          {exportProgress?.status === 'complete' && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-sm text-green-600">
                Export completed successfully!
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Toast notifications */}
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`fixed bottom-4 right-4 z-50 max-w-sm w-full bg-card text-card-foreground border rounded-lg shadow-lg p-4 transition-all duration-300 ${
            toast.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {toast.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${toast.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
