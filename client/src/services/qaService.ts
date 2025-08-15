import { API_BASE_URL } from '../config/index';
import { fetchJson, FetchError } from '@/lib/fetchJson';

export interface QAMessage {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
  sources?: Source[];
  status: 'streaming' | 'completed' | 'error';
  confidence?: number;
}

export interface Source {
  id: string;
  title: string;
  type: string;
  confidence: number;
  excerpt: string;
}

export interface QARequest {
  deal_id: string;
  question: string;
  context?: string;
  evidence?: string[];
}

export interface QAResponse {
  id: string;
  deal_id: string;
  question: string;
  answer: string;
  ai_response: string;
  confidence: number;
  sources: Source[];
  created_at: string;
  context?: {
    hasSufficientData: boolean;
    dataQuality: 'high' | 'medium' | 'low';
    missingContext: string[];
  };
  guardrail_results?: {
    passed: boolean;
    warnings: string[];
    suggestions: string[];
    requiresManualReview: boolean;
  };
  rag_context?: {
    enabled: boolean;
    chunks_retrieved: number;
    total_available_chunks: number;
    search_confidence?: number;
  };
}

export interface QAHistoryItem {
  id: string;
  deal_id: string;
  question: string;
  answer: string;
  context?: string;
  created_at: string;
  updated_at?: string;
}

class QAService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/qa`;
  }

  /**
   * Ask a question and get AI-powered response
   */
  async askQuestion(request: QARequest): Promise<QAResponse> {
    try {
      return await fetchJson(`${this.baseUrl}/ask`, {
        method: 'POST',
        body: JSON.stringify(request),
      });
    } catch (error) {
      console.error('Error asking question:', error);
      throw error;
    }
  }

  /**
   * Get Q&A history for a deal
   */
  async getHistory(dealId: string): Promise<QAHistoryItem[]> {
    try {
      // For demo purposes, we'll use a mock user ID
      const response = await fetch(`${this.baseUrl}/deal/${dealId}?user_id=demo-user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch history');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Q&A history:', error);
      // Return empty array on error to prevent UI breaking
      return [];
    }
  }

  /**
   * Create a new Q&A entry (for manual entries)
   */
  async createQAEntry(request: QARequest): Promise<QAHistoryItem> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          asked_by: 'demo-user', // For demo purposes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create Q&A entry');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating Q&A entry:', error);
      throw error;
    }
  }

  /**
   * Update an existing Q&A entry
   */
  async updateQAEntry(id: string, updates: Partial<QAHistoryItem>): Promise<QAHistoryItem> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update Q&A entry');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating Q&A entry:', error);
      throw error;
    }
  }

  /**
   * Delete a Q&A entry
   */
  async deleteQAEntry(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete Q&A entry');
      }
    } catch (error) {
      console.error('Error deleting Q&A entry:', error);
      throw error;
    }
  }

  /**
   * Generate mock sources for demo purposes
   * In production, this would come from the actual evidence system
   */
  generateMockSources(question: string): Source[] {
    const mockSources: Source[] = [
      {
        id: '1',
        title: 'Financial Statements 2023',
        type: 'Income Statement',
        confidence: 0.95,
        excerpt: 'Revenue growth of 15% year-over-year with improving margins from 28% to 32% over the last three years.'
      },
      {
        id: '2',
        title: 'Balance Sheet Analysis',
        type: 'Balance Sheet',
        confidence: 0.88,
        excerpt: 'Working capital improved by $2.3M due to better inventory management and faster receivables collection.'
      },
      {
        id: '3',
        title: 'Cash Flow Statement',
        type: 'Cash Flow',
        confidence: 0.92,
        excerpt: 'Cash flow from operations increased by 22% year-over-year, driven by improved working capital efficiency.'
      }
    ];

    // Filter sources based on question content for more realistic behavior
    const questionLower = question.toLowerCase();
    if (questionLower.includes('margin') || questionLower.includes('revenue')) {
      return mockSources.filter(s => s.type === 'Income Statement');
    } else if (questionLower.includes('working capital') || questionLower.includes('balance')) {
      return mockSources.filter(s => s.type === 'Balance Sheet');
    } else if (questionLower.includes('cash flow') || questionLower.includes('cash')) {
      return mockSources.filter(s => s.type === 'Cash Flow');
    }

    return mockSources;
  }
}

export const qaService = new QAService();
