import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, FileSpreadsheet, Settings, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { exportService, ExportOptions, ExportProgress } from '../../services/exportService';
import { SummaryReport } from '../../../../shared/src/types';

interface ExportButtonsProps {
  dealId: string;
  summaryReport: SummaryReport;
  computedMetrics: any;
  className?: string;
}

export function ExportButtons({ dealId, summaryReport, computedMetrics, className }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    theme: 'professional',
    includeCharts: true,
    includeAppendix: false,
    includeRawData: true,
    includeEvidence: true
  });

  const handleExport = async (format: 'pdf' | 'xlsx') => {
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

  const getProgressColor = (status: ExportProgress['status']) => {
    switch (status) {
      case 'preparing':
      case 'generating':
      case 'downloading':
        return 'text-blue-600';
      case 'complete':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getProgressIcon = (status: ExportProgress['status']) => {
    switch (status) {
      case 'preparing':
      case 'generating':
      case 'downloading':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'complete':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Download className="w-4 h-4" />;
    }
  };

  const estimatedPdfSize = exportService.getEstimatedFileSize('pdf', summaryReport, exportOptions.includeCharts);
  const estimatedExcelSize = exportService.getEstimatedFileSize('xlsx', summaryReport, exportOptions.includeCharts);

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {/* Export Options Dialog */}
      <Dialog open={showOptions} onOpenChange={setShowOptions}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Options
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Options</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Theme Selection */}
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={exportOptions.theme}
                onValueChange={(value: 'professional' | 'modern' | 'minimal') =>
                  setExportOptions(prev => ({ ...prev, theme: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* PDF Options */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">PDF Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeCharts"
                    checked={exportOptions.includeCharts}
                    onCheckedChange={(checked) =>
                      setExportOptions(prev => ({ ...prev, includeCharts: checked as boolean }))
                    }
                  />
                  <Label htmlFor="includeCharts" className="text-sm">
                    Include Charts & Visualizations
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeAppendix"
                    checked={exportOptions.includeAppendix}
                    onCheckedChange={(checked) =>
                      setExportOptions(prev => ({ ...prev, includeAppendix: checked as boolean }))
                    }
                  />
                  <Label htmlFor="includeAppendix" className="text-sm">
                    Include Evidence Appendix
                  </Label>
                </div>
              </div>
            </div>

            {/* Excel Options */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Excel Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeRawData"
                    checked={exportOptions.includeRawData}
                    onCheckedChange={(checked) =>
                      setExportOptions(prev => ({ ...prev, includeRawData: checked as boolean }))
                    }
                  />
                  <Label htmlFor="includeRawData" className="text-sm">
                    Include Raw Data Sheet
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeEvidence"
                    checked={exportOptions.includeEvidence}
                    onCheckedChange={(checked) =>
                      setExportOptions(prev => ({ ...prev, includeEvidence: checked as boolean }))
                    }
                  />
                  <Label htmlFor="includeEvidence" className="text-sm">
                    Include Evidence Map
                  </Label>
                </div>
              </div>
            </div>

            {/* File Size Estimates */}
            <div className="pt-2 border-t">
              <Label className="text-sm font-medium">Estimated File Sizes</Label>
              <div className="flex space-x-4 text-sm text-gray-600">
                <span>PDF: ~{estimatedPdfSize}</span>
                <span>Excel: ~{estimatedExcelSize}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PDF Export Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('pdf')}
        disabled={isExporting}
        className="min-w-[80px]"
      >
        {isExporting && exportProgress?.status === 'preparing' ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <FileText className="w-4 h-4 mr-2" />
        )}
        PDF
      </Button>

      {/* Excel Export Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('xlsx')}
        disabled={isExporting}
        className="min-w-[80px]"
      >
        {isExporting && exportProgress?.status === 'preparing' ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <FileSpreadsheet className="w-4 h-4 mr-2" />
        )}
        Excel
      </Button>

      {/* Progress Indicator */}
      {exportProgress && (
        <div className="flex items-center space-x-2">
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              exportProgress.status === 'complete' && "border-green-200 text-green-700",
              exportProgress.status === 'error' && "border-red-200 text-red-700"
            )}
          >
            <span className={cn("mr-1", getProgressColor(exportProgress.status))}>
              {getProgressIcon(exportProgress.status)}
            </span>
            {exportProgress.message}
          </Badge>
          
          {exportProgress.status === 'generating' && (
            <div className="w-16 bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${exportProgress.progress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {exportProgress?.status === 'error' && exportProgress.error && (
        <div className="text-xs text-red-600 max-w-xs">
          {exportProgress.error}
        </div>
      )}
    </div>
  );
}
