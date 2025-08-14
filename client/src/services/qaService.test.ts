import { qaService } from './qaService';

// Mock fetch globally
global.fetch = jest.fn();

describe('QAService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('askQuestion', () => {
    it('should make a POST request to the correct endpoint', async () => {
      const mockResponse = {
        id: 'qa-123',
        deal_id: 'deal-456',
        question: 'How are margins trending?',
        answer: 'Margins are improving...',
        ai_response: 'Margins are improving...',
        confidence: 0.9,
        sources: ['source1', 'source2']
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await qaService.askQuestion({
        deal_id: 'deal-456',
        question: 'How are margins trending?'
      });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/qa/ask',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            deal_id: 'deal-456',
            question: 'How are margins trending?'
          }),
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors correctly', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'API Error' })
      });

      await expect(
        qaService.askQuestion({
          deal_id: 'deal-456',
          question: 'How are margins trending?'
        })
      ).rejects.toThrow('API Error');
    });
  });

  describe('getHistory', () => {
    it('should make a GET request to fetch history', async () => {
      const mockHistory = [
        {
          id: 'qa-1',
          deal_id: 'deal-456',
          question: 'Question 1',
          answer: 'Answer 1',
          created_at: '2024-01-01T00:00:00Z'
        }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockHistory
      });

      const result = await qaService.getHistory('deal-456');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/qa/deal/deal-456?user_id=demo-user',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      expect(result).toEqual(mockHistory);
    });

    it('should return empty array on error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await qaService.getHistory('deal-456');

      expect(result).toEqual([]);
    });
  });

  describe('generateMockSources', () => {
    it('should return relevant sources based on question content', () => {
      const marginQuestion = 'How are gross margins trending?';
      const sources = qaService.generateMockSources(marginQuestion);

      expect(sources).toHaveLength(1);
      expect(sources[0].type).toBe('Income Statement');
    });

    it('should return working capital sources for balance sheet questions', () => {
      const workingCapitalQuestion = 'What is the working capital cycle?';
      const sources = qaService.generateMockSources(workingCapitalQuestion);

      expect(sources).toHaveLength(1);
      expect(sources[0].type).toBe('Balance Sheet');
    });

    it('should return cash flow sources for cash flow questions', () => {
      const cashFlowQuestion = 'How is cash flow from operations?';
      const sources = qaService.generateMockSources(cashFlowQuestion);

      expect(sources).toHaveLength(1);
      expect(sources[0].type).toBe('Cash Flow');
    });

    it('should return all sources for general questions', () => {
      const generalQuestion = 'What is the overall financial health?';
      const sources = qaService.generateMockSources(generalQuestion);

      expect(sources).toHaveLength(3);
    });
  });
});
