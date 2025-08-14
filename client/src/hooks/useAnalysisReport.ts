import { useState, useEffect, useCallback } from 'react';
import { TAnalysisReport, TReportGenerationRequest, TReportGenerationResponse, SummaryReport } from '../../../shared/src/types';

interface UseAnalysisReportOptions {
  dealId?: string;
  reportId?: string;
  autoFetch?: boolean;
}

interface UseAnalysisReportReturn {
  // Report data
  report: TAnalysisReport | null;
  reports: TAnalysisReport[];
  summaryReport: SummaryReport | null;
  
  // Loading states
  isLoading: boolean;
  isGenerating: boolean;
  isSearching: boolean;
  
  // Error states
  error: string | null;
  generationError: string | null;
  
  // Actions
  generateReport: (request: TReportGenerationRequest) => Promise<TReportGenerationResponse | null>;
  fetchReport: (reportId: string) => Promise<TAnalysisReport | null>;
  fetchSummaryReport: (dealId: string) => Promise<SummaryReport | null>;
  searchReports: (filters?: any) => Promise<TAnalysisReport[]>;
  refreshReport: () => Promise<void>;
  
  // Generation status
  generationStatus: TReportGenerationResponse | null;
  pollGenerationStatus: () => void;
}

/**
 * Custom hook for managing analysis report data
 * Handles fetching, generation, and status polling
 */
export function useAnalysisReport(options: UseAnalysisReportOptions = {}): UseAnalysisReportReturn {
  const { dealId, reportId, autoFetch = false } = options;
  
  // State
  const [report, setReport] = useState<TAnalysisReport | null>(null);
  const [reports, setReports] = useState<TAnalysisReport[]>([]);
  const [summaryReport, setSummaryReport] = useState<SummaryReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<TReportGenerationResponse | null>(null);
  
  // Polling interval for generation status
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Base API URL
  const API_BASE = 'http://localhost:3001/api/analyze';

  /**
   * Generate a new analysis report
   */
  const generateReport = useCallback(async (request: TReportGenerationRequest): Promise<TReportGenerationResponse | null> => {
    try {
      setIsGenerating(true);
      setGenerationError(null);
      
      const response = await fetch(`${API_BASE}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start report generation');
      }

      const result: TReportGenerationResponse = await response.json();
      setGenerationStatus(result);
      
      // Start polling if generation is queued or processing
      if (result.status === 'queued' || result.status === 'processing') {
        startPolling(result.report_id!);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setGenerationError(errorMessage);
      
      // Return a proper error response instead of null
      return {
        success: false,
        status: 'failed',
        error: errorMessage
      };
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /**
   * Fetch a specific report by ID
   */
  const fetchReport = useCallback(async (id: string): Promise<TAnalysisReport | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/report/${id}?userId=current`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(errorData.error || 'Failed to fetch report');
      }

      const data = await response.json();
      const fetchedReport = data.report;
      
      setReport(fetchedReport);
      return fetchedReport;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch report';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch enhanced summary report for a deal
   */
  const fetchSummaryReport = useCallback(async (dealId: string): Promise<SummaryReport | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dealId, userId: 'user_123' }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        
        // If it's a 404 or similar error, it means no report exists yet - this is not an error
        if (response.status === 404 || response.status === 400) {
          setSummaryReport(null);
          setError(null); // Clear any previous errors
          return null;
        }
        
        throw new Error(errorData.error || 'Failed to fetch summary report');
      }

      const data = await response.json();
      
      if (data.summaryReport) {
        setSummaryReport(data.summaryReport);
        return data.summaryReport;
      } else {
        // No summary report in response, but this is not an error
        setSummaryReport(null);
        setError(null); // Clear any previous errors
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch summary report';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Search reports with filters
   */
  const searchReports = useCallback(async (filters: any = {}): Promise<TAnalysisReport[]> => {
    try {
      setIsSearching(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        userId: 'current',
        ...filters,
      });
      
      const response = await fetch(`${API_BASE}/reports?${queryParams}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(errorData.error || 'Failed to search reports');
      }

      const data = await response.json();
      const fetchedReports = data.reports || [];
      
      setReports(fetchedReports);
      return fetchedReports;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search reports';
      setError(errorMessage);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, []);

  /**
   * Refresh the current report
   */
  const refreshReport = useCallback(async (): Promise<void> => {
    if (report?.id) {
      await fetchReport(report.id);
    }
  }, [report?.id, fetchReport]);

  /**
   * Start polling for generation status
   */
  const startPolling = useCallback((reportId: string) => {
    // Clear any existing interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    // REMOVED AUTOMATIC POLLING FOR DEBUGGING - use manual polling instead
    // const interval = setInterval(async () => {
    //   try {
    //     const response = await fetch(`${API_BASE}/report/${reportId}/status?userId=current`);
    //     
    //     if (response.ok) {
    //       const status = await response.json();
    //       
    //       if (status.status === 'completed' || status.status === 'failed') {
    //         // Stop polling and fetch the complete report
    //         clearInterval(interval);
    //         setPollingInterval(null);
    //         
    //         if (status.status === 'completed') {
    //           await fetchReport(reportId);
    //         }
    //       }
    //       
    //       // Update generation status
    //       setGenerationStatus({
    //         success: status.status !== 'failed',
    //         report_id: reportId,
    //         status: status.status,
    //         progress: status.progress || 0,
    //         error: status.error
    //       });
    //     }
    //   } catch (err) {
    //     console.error('Error polling generation status:', err);
    //   }
    // }, 5000); // Poll every 5 seconds

    // setPollingInterval(interval);
  }, [fetchReport]);

  /**
   * Poll generation status manually
   */
  const pollGenerationStatus = useCallback(() => {
    if (generationStatus?.report_id && 
        (generationStatus.status === 'queued' || generationStatus.status === 'processing')) {
      startPolling(generationStatus.report_id);
    }
  }, [generationStatus, startPolling]);

  /**
   * Auto-fetch report if reportId is provided
   */
  useEffect(() => {
    if (autoFetch && reportId) {
      fetchReport(reportId);
    }
  }, [autoFetch, reportId, fetchReport]);

  /**
   * Auto-fetch summary report if dealId is provided
   */
  useEffect(() => {
    if (autoFetch && dealId) {
      fetchSummaryReport(dealId);
    }
  }, [autoFetch, dealId, fetchSummaryReport]);

  /**
   * Auto-search reports if dealId is provided
   */
  useEffect(() => {
    if (autoFetch && dealId) {
      searchReports({ deal_id: dealId });
    }
  }, [autoFetch, dealId, searchReports]);

  /**
   * Cleanup polling interval on unmount
   */
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  return {
    // Data
    report,
    reports,
    summaryReport,
    
    // Loading states
    isLoading,
    isGenerating,
    isSearching,
    
    // Error states
    error,
    generationError,
    
    // Actions
    generateReport,
    fetchReport,
    fetchSummaryReport,
    searchReports,
    refreshReport,
    
    // Generation status
    generationStatus,
    pollGenerationStatus,
  };
}

/**
 * Hook for managing report generation with progress tracking
 */
export function useReportGeneration() {
  const [generationProgress, setGenerationProgress] = useState<{
    [reportId: string]: {
      status: string;
      progress: number;
      message?: string;
      error?: string;
    };
  }>({});

  const updateProgress = useCallback((reportId: string, progress: any) => {
    setGenerationProgress(prev => ({
      ...prev,
      [reportId]: progress
    }));
  }, []);

  const clearProgress = useCallback((reportId: string) => {
    setGenerationProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[reportId];
      return newProgress;
    });
  }, []);

  return {
    generationProgress,
    updateProgress,
    clearProgress,
  };
}

/**
 * Hook for managing report filters and search
 */
export function useReportFilters() {
  const [filters, setFilters] = useState({
    deal_id: '',
    report_type: '',
    status: '',
    date_from: '',
    date_to: '',
    page: 1,
    limit: 20,
    sort_by: 'created_at' as const,
    sort_order: 'desc' as const,
  });

  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      deal_id: '',
      report_type: '',
      status: '',
      date_from: '',
      date_to: '',
      page: 1,
      limit: 20,
      sort_by: 'created_at',
      sort_order: 'desc',
    });
  }, []);

  return {
    filters,
    updateFilter,
    resetFilters,
  };
}
