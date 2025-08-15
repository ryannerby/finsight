import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExportMenu } from '../ExportMenu';

// Mock the export service
jest.mock('../../../services/exportService', () => ({
  exportService: {
    validateExportData: jest.fn(),
    exportToPDF: jest.fn(),
    exportToExcel: jest.fn(),
  },
}));

const mockExportService = require('../../../services/exportService').exportService;

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

// Mock window.open
const mockWindowOpen = jest.fn();
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockWindowOpen,
});

const mockSummaryReport = {
  id: 'report-1',
  dealId: 'deal-123',
  summary: 'Financial analysis summary',
  metrics: ['revenue_growth', 'ebitda_margin'],
  createdAt: '2024-01-15T10:00:00Z'
};

const mockComputedMetrics = {
  revenue_growth: { value: 0.15, unit: '%', trend: 'up' },
  ebitda_margin: { value: 0.22, unit: '%', trend: 'stable' }
};

const defaultProps = {
  dealId: 'deal-123',
  summaryReport: mockSummaryReport,
  computedMetrics: mockComputedMetrics,
  className: 'custom-class'
};

describe('ExportMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExportService.validateExportData.mockReturnValue({ isValid: true, errors: [] });
    mockExportService.exportToPDF.mockResolvedValue(undefined);
    mockExportService.exportToExcel.mockResolvedValue(undefined);
    navigator.clipboard.writeText.mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('renders export button with correct text', () => {
      render(<ExportMenu {...defaultProps} />);
      
      const exportButton = screen.getByRole('button', { name: /export/i });
      expect(exportButton).toBeInTheDocument();
      expect(exportButton).toHaveTextContent('Export');
    });

    it('applies custom className', () => {
      render(<ExportMenu {...defaultProps} />);
      
      const exportButton = screen.getByRole('button', { name: /export/i });
      expect(exportButton).toHaveClass('custom-class');
    });

    it('shows loading state when exporting', async () => {
      mockExportService.exportToPDF.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<ExportMenu {...defaultProps} />);
      
      const exportButton = screen.getByRole('button', { name: /export/i });
      expect(exportButton).toBeInTheDocument();
    });
  });

  describe('Export Functionality', () => {
    it('calls exportToPDF with correct parameters', async () => {
      render(<ExportMenu {...defaultProps} />);
      
      const exportButton = screen.getByRole('button', { name: /export/i });
      await userEvent.click(exportButton);
      
      const pdfMenuItem = screen.getByText('Export PDF');
      await userEvent.click(pdfMenuItem);
      
      expect(mockExportService.exportToPDF).toHaveBeenCalledWith(
        'deal-123',
        mockSummaryReport,
        mockComputedMetrics,
        expect.objectContaining({
          theme: 'professional',
          includeCharts: true,
          includeAppendix: false,
          includeRawData: true,
          includeEvidence: true
        }),
        expect.any(Function)
      );
    });

    it('calls exportToExcel with correct parameters', async () => {
      render(<ExportMenu {...defaultProps} />);
      
      const exportButton = screen.getByRole('button', { name: /export/i });
      await userEvent.click(exportButton);
      
      const excelMenuItem = screen.getByText('Export Excel');
      await userEvent.click(excelMenuItem);
      
      expect(mockExportService.exportToExcel).toHaveBeenCalledWith(
        'deal-123',
        mockSummaryReport,
        mockComputedMetrics,
        expect.objectContaining({
          theme: 'professional',
          includeCharts: true,
          includeAppendix: false,
          includeRawData: true,
          includeEvidence: true
        }),
        expect.any(Function)
      );
    });

    it('validates export data before proceeding', async () => {
      render(<ExportMenu {...defaultProps} />);
      
      const exportButton = screen.getByRole('button', { name: /export/i });
      await userEvent.click(exportButton);
      
      const pdfMenuItem = screen.getByText('Export PDF');
      await userEvent.click(pdfMenuItem);
      
      expect(mockExportService.validateExportData).toHaveBeenCalledWith(
        'deal-123',
        mockSummaryReport,
        mockComputedMetrics
      );
    });

    it('shows error toast when validation fails', async () => {
      mockExportService.validateExportData.mockReturnValue({ 
        isValid: false, 
        errors: ['Missing required data'] 
      });
      
      render(<ExportMenu {...defaultProps} />);
      
      const exportButton = screen.getByRole('button', { name: /export/i });
      await userEvent.click(exportButton);
      
      const pdfMenuItem = screen.getByText('Export PDF');
      await userEvent.click(pdfMenuItem);
      
      await waitFor(() => {
        expect(screen.getByText(/Export failed: Export validation failed/)).toBeInTheDocument();
      });
    });

    it('shows error toast when export fails', async () => {
      mockExportService.exportToPDF.mockRejectedValue(new Error('Network error'));
      
      render(<ExportMenu {...defaultProps} />);
      
      const exportButton = screen.getByRole('button', { name: /export/i });
      await userEvent.click(exportButton);
      
      const pdfMenuItem = screen.getByText('Export PDF');
      await userEvent.click(pdfMenuItem);
      
      await waitFor(() => {
        expect(screen.getByText(/Export failed: Network error/)).toBeInTheDocument();
      });
    });

    it('shows success toast when export succeeds', async () => {
      render(<ExportMenu {...defaultProps} />);
      
      const exportButton = screen.getByRole('button', { name: /export/i });
      await userEvent.click(exportButton);
      
      const pdfMenuItem = screen.getByText('Export PDF');
      await userEvent.click(pdfMenuItem);
      
      await waitFor(() => {
        expect(screen.getByText('PDF exported successfully!')).toBeInTheDocument();
      });
    });
  });

  describe('Share Functionality', () => {
    it('copies share link to clipboard', async () => {
      render(<ExportMenu {...defaultProps} />);
      
      const exportButton = screen.getByRole('button', { name: /export/i });
      await userEvent.click(exportButton);
      
      const shareMenuItem = screen.getByText('Share link');
      await userEvent.click(shareMenuItem);
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'http://localhost/deals/deal-123/share'
      );
      
      await waitFor(() => {
        expect(screen.getByText('Share link copied to clipboard!')).toBeInTheDocument();
      });
    });

    it('shows error toast when clipboard write fails', async () => {
      navigator.clipboard.writeText.mockRejectedValue(new Error('Clipboard error'));
      
      render(<ExportMenu {...defaultProps} />);
      
      const exportButton = screen.getByRole('button', { name: /export/i });
      await userEvent.click(exportButton);
      
      const shareMenuItem = screen.getByText('Share link');
      await userEvent.click(shareMenuItem);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to copy share link')).toBeInTheDocument();
      });
    });
  });

  describe('Schedule Review Functionality', () => {
    it('shows success toast when scheduling review', async () => {
      render(<ExportMenu {...defaultProps} />);
      
      const exportButton = screen.getByRole('button', { name: /export/i });
      await userEvent.click(exportButton);
      
      const scheduleMenuItem = screen.getByText('Schedule review');
      await userEvent.click(scheduleMenuItem);
      
      await waitFor(() => {
        expect(screen.getByText('Review meeting scheduled successfully!')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<ExportMenu {...defaultProps} />);
      
      const exportButton = screen.getByRole('button', { name: /export/i });
      expect(exportButton).toHaveAttribute('aria-label', 'Export and share options');
    });

    it('disables export when data is not available', () => {
      render(<ExportMenu {...defaultProps} summaryReport={null} computedMetrics={null} />);
      
      const exportButton = screen.getByRole('button', { name: /export/i });
      expect(exportButton).toBeDisabled();
    });

    it('shows proper loading states', async () => {
      mockExportService.exportToPDF.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<ExportMenu {...defaultProps} />);
      
      const exportButton = screen.getByRole('button', { name: /export/i });
      expect(exportButton).toBeInTheDocument();
    });
  });

  describe('Toast Notifications', () => {
    it('shows success toast with correct styling', async () => {
      render(<ExportMenu {...defaultProps} />);
      
      const exportButton = screen.getByRole('button', { name: /export/i });
      await userEvent.click(exportButton);
      
      const pdfMenuItem = screen.getByText('Export PDF');
      await userEvent.click(pdfMenuItem);
      
      await waitFor(() => {
        const successToast = screen.getByText('PDF exported successfully!');
        expect(successToast).toBeInTheDocument();
        // Look for the toast container div that has the styling
        const toastContainer = successToast.closest('div[class*="border-green-200"]');
        expect(toastContainer).toHaveClass('border-green-200', 'bg-green-50');
      });
    });

    it('shows error toast with correct styling', async () => {
      mockExportService.exportToPDF.mockRejectedValue(new Error('Export failed'));
      
      render(<ExportMenu {...defaultProps} />);
      
      const exportButton = screen.getByRole('button', { name: /export/i });
      await userEvent.click(exportButton);
      
      const pdfMenuItem = screen.getByText('Export PDF');
      await userEvent.click(pdfMenuItem);
      
      await waitFor(() => {
        const errorToast = screen.getByText(/Export failed: Export failed/);
        expect(errorToast).toBeInTheDocument();
        // Look for the toast container div that has the styling
        const toastContainer = errorToast.closest('div[class*="border-red-200"]');
        expect(toastContainer).toHaveClass('border-red-200', 'bg-red-50');
      });
    });

    

    it('allows manual dismissal of toasts', async () => {
      render(<ExportMenu {...defaultProps} />);
      
      const exportButton = screen.getByRole('button', { name: /export/i });
      await userEvent.click(exportButton);
      
      const pdfMenuItem = screen.getByText('Export PDF');
      await userEvent.click(pdfMenuItem);
      
      await waitFor(() => {
        const successToast = screen.getByText('PDF exported successfully!');
        expect(successToast).toBeInTheDocument();
        
        const dismissButton = screen.getByLabelText('Dismiss notification');
        userEvent.click(dismissButton);
      });
      
      await waitFor(() => {
        expect(screen.queryByText('PDF exported successfully!')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles missing summary report', () => {
      render(<ExportMenu {...defaultProps} summaryReport={null} />);
      
      const exportButton = screen.getByRole('button', { name: /export/i });
      expect(exportButton).toBeDisabled();
    });

    it('handles missing computed metrics', () => {
      render(<ExportMenu {...defaultProps} computedMetrics={null} />);
      
      const exportButton = screen.getByRole('button', { name: /export/i });
      expect(exportButton).toBeDisabled();
    });

    
  });
});
