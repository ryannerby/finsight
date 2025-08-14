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
import { Download, FileText, FileSpreadsheet, Settings, Loader2 } from 'lucide-react';
import { exportService, ExportOptions, ExportProgress } from '../../services/exportService';

interface ExportMenuProps {
  dealId: string;
  summaryReport?: any;
  computedMetrics?: any;
  className?: string;
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

  const handleExport = async (format: 'pdf' | 'xlsx') => {
    if (!summaryReport || !computedMetrics) {
      console.warn('Export data not available');
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
      } else {
        await exportService.exportToExcel(
          dealId,
          summaryReport,
          computedMetrics,
          exportOptions,
          setExportProgress
        );
      }

      // Show success message briefly
      setTimeout(() => {
        setExportProgress(null);
      }, 2000);

    } catch (error) {
      console.error(`Export to ${format.toUpperCase()} failed:`, error);
      setExportProgress({
        status: 'error',
        progress: 0,
        message: 'Export failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const isExportDisabled = !summaryReport || !computedMetrics || isExporting;

  return (
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
        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => handleExport('pdf')}
          disabled={isExportDisabled}
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          Export as PDF
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
          Export as Excel
          {exportProgress?.status === 'preparing' && (
            <Badge variant="secondary" className="ml-auto">
              Preparing...
            </Badge>
          )}
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
  );
}
