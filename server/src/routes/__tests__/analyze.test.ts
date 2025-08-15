import request from 'supertest';
import express from 'express';
import { analyzeRouter } from '../analyze';
import { supabase } from '../../config/supabase';
import { AnalysisErrorHandler } from '../../services/errorHandler';

// Mock dependencies
jest.mock('../../config/supabase');
jest.mock('../../services/enhancedAnalysis');
jest.mock('../../lib/logger');

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

const app = express();
app.use(express.json());
app.use('/api/analyze', analyzeRouter);

describe('Analyze Route - Phase 5 Enhancements', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = 'test-api-key-12345678901234567890';
  });

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
  });

  describe('PHASE 5.1: Ownership & Auth Logging', () => {
    it('should log dealId/userId pair for analysis requests', async () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'deal-123', user_id: 'user-456' },
              error: null
            })
          })
        })
      } as any);

      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [
              {
                id: 'doc-123',
                filename: 'test.csv',
                mime_type: 'text/csv',
                file_path: 'documents/test.csv',
                analyses: []
              }
            ],
            error: null
          })
        })
      } as any);

      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'analysis-123' },
              error: null
            })
          })
        })
      } as any);

      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn().mockResolvedValue({
          data: [{ id: 'log-123' }],
          error: null
        })
      } as any);

      await request(app)
        .post('/api/analyze')
        .send({ dealId: 'deal-123', userId: 'user-456' })
        .expect(200);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Analysis request initiated'),
        expect.objectContaining({
          dealId: 'deal-123',
          userId: 'user-456'
        })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('PHASE 5.2: Document Fetch Logging', () => {
    it('should log document count, file types, and storage paths', async () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'deal-123', user_id: 'user-456' },
              error: null
            })
          })
        })
      } as any);

      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [
              {
                id: 'doc-123',
                filename: 'test.csv',
                mime_type: 'text/csv',
                file_type: 'P&L',
                file_size: 1024,
                file_path: 'documents/test.csv',
                analyses: []
              },
              {
                id: 'doc-456',
                filename: 'balance.xlsx',
                mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                file_type: 'balance_sheet',
                file_size: 2048,
                file_path: 'documents/balance.xlsx',
                analyses: []
              }
            ],
            error: null
          })
        })
      } as any);

      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'analysis-123' },
              error: null
            })
          })
        })
      } as any);

      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn().mockResolvedValue({
          data: [{ id: 'log-123' }],
          error: null
        })
      } as any);

      await request(app)
        .post('/api/analyze')
        .send({ dealId: 'deal-123', userId: 'user-456' })
        .expect(200);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Documents fetched successfully'),
        expect.objectContaining({
          documentCount: 2,
          documentTypes: ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
          storagePaths: ['documents/test.csv', 'documents/balance.xlsx'],
          totalFileSize: 3072
        })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('PHASE 5.3: Metrics Computation Logging', () => {
    it('should log per-metric inputs and outputs (rounded)', async () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'deal-123', user_id: 'user-456' },
              error: null
            })
          })
        })
      } as any);

      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [
              {
                id: 'doc-123',
                filename: 'test.csv',
                mime_type: 'text/csv',
                file_path: 'documents/test.csv',
                analyses: []
              }
            ],
            error: null
          })
        })
      } as any);

      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'analysis-123' },
              error: null
            })
          })
        })
      } as any);

      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn().mockResolvedValue({
          data: [{ id: 'log-123' }],
          error: null
        })
      } as any);

      await request(app)
        .post('/api/analyze')
        .send({ dealId: 'deal-123', userId: 'user-456' })
        .expect(200);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Individual metrics computed'),
        expect.objectContaining({
          metrics: expect.arrayContaining([
            expect.objectContaining({
              metric: expect.any(String),
              value: expect.any(Number),
              status: expect.stringMatching(/computed|missing_data/)
            })
          ])
        })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('PHASE 5.4: LLM Summary Error Handling', () => {
    it('should return LLMUnavailableError when ANTHROPIC_API_KEY is missing', async () => {
      delete process.env.ANTHROPIC_API_KEY;
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'deal-123', user_id: 'user-456' },
              error: null
            })
          })
        })
      } as any);

      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [
              {
                id: 'doc-123',
                filename: 'test.csv',
                mime_type: 'text/csv',
                file_path: 'documents/test.csv',
                analyses: []
              }
            ],
            error: null
          })
        })
      } as any);

      const response = await request(app)
        .post('/api/analyze')
        .send({ dealId: 'deal-123', userId: 'user-456' })
        .expect(503);

      expect(response.body).toEqual({
        error: 'AI analysis service is currently unavailable',
        type: 'llm_unavailable',
        details: { reason: 'API key missing or invalid' }
      });
    });

    it('should return LLMUnavailableError when ANTHROPIC_API_KEY is too short', async () => {
      process.env.ANTHROPIC_API_KEY = 'short';
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'deal-123', user_id: 'user-456' },
              error: null
            })
          })
        })
      } as any);

      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [
              {
                id: 'doc-123',
                filename: 'test.csv',
                mime_type: 'text/csv',
                file_path: 'documents/test.csv',
                analyses: []
              }
            ],
            error: null
          })
        })
      } as any);

      const response = await request(app)
        .post('/api/analyze')
        .send({ dealId: 'deal-123', userId: 'user-456' })
        .expect(503);

      expect(response.body).toEqual({
        error: 'AI analysis service is currently unavailable',
        type: 'llm_unavailable',
        details: { reason: 'API key missing or invalid' }
      });
    });
  });

  describe('PHASE 5.5: Persistence Verification', () => {
    it('should log returned IDs from database inserts', async () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'deal-123', user_id: 'user-456' },
              error: null
            })
          })
        })
      } as any);

      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [
              {
                id: 'doc-123',
                filename: 'test.csv',
                mime_type: 'text/csv',
                file_path: 'documents/test.csv',
                analyses: []
              }
            ],
            error: null
          })
        })
      } as any);

      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'analysis-123' },
              error: null
            })
          })
        })
      } as any);

      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn().mockResolvedValue({
          data: [{ id: 'log-123' }],
          error: null
        })
      } as any);

      await request(app)
        .post('/api/analyze')
        .send({ dealId: 'deal-123', userId: 'user-456' })
        .expect(200);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Financial analysis persisted successfully'),
        expect.objectContaining({
          dealId: 'deal-123',
          analysisId: 'analysis-123',
          documentId: 'doc-123'
        })
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Analysis pipeline completed successfully'),
        expect.objectContaining({
          dealId: 'deal-123',
          userId: 'user-456',
          financialAnalysisId: 'analysis-123'
        })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database connection failed' }
            })
          })
        })
      } as any);

      const response = await request(app)
        .post('/api/analyze')
        .send({ dealId: 'deal-123', userId: 'user-456' })
        .expect(404);

      expect(response.body).toEqual({
        error: 'Deal not found or access denied'
      });
    });

    it('should handle missing documents gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'deal-123', user_id: 'user-456' },
              error: null
            })
          })
        })
      } as any);

      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      } as any);

      const response = await request(app)
        .post('/api/analyze')
        .send({ dealId: 'deal-123', userId: 'user-456' })
        .expect(400);

      expect(response.body).toEqual({
        error: 'No documents found for analysis'
      });
    });
  });
});
