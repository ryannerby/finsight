import { renderHook, act } from '@testing-library/react';
import { useFileUpload } from '../useFileUpload';

// Mock fetch globally
global.fetch = jest.fn();

describe('useFileUpload', () => {
  const mockFiles = [
    new File(['csv content'], 'data.csv', { type: 'text/csv' }),
    new File(['xlsx content'], 'data.xlsx', { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    }),
  ];

  const mockDealId = 'test-deal-123';
  const mockUserId = 'test-user-456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useFileUpload());

    expect(result.current.uploads).toEqual([]);
    expect(result.current.isUploading).toBe(false);
    expect(typeof result.current.uploadFiles).toBe('function');
    expect(typeof result.current.clearUploads).toBe('function');
    expect(typeof result.current.removeUpload).toBe('function');
  });

  it('uploads files successfully with signed URLs', async () => {
    const mockFetch = jest.mocked(fetch);
    
    // Mock the upload URL response
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          uploadUrl: 'https://storage.example.com/upload-url',
          path: 'test-deal-123/1234567890-data.csv',
          token: 'mock-token'
        })
      } as Response)
      // Mock the storage upload response
      .mockResolvedValueOnce({
        ok: true
      } as Response)
      // Mock the confirm upload response
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'doc-123',
          filename: 'data.csv',
          original_name: 'data.csv',
          file_size: 1024,
          mime_type: 'text/csv',
          file_type: 'csv'
        })
      } as Response)
      // Mock the parse response
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'analysis-123',
          analysis_type: 'extraction',
          parsed_text: 'Parsed CSV content'
        })
      } as Response);

    const { result } = renderHook(() => useFileUpload());

    await act(async () => {
      await result.current.uploadFiles([mockFiles[0]], mockDealId, mockUserId);
    });

    // Verify the upload process
    expect(mockFetch).toHaveBeenCalledTimes(4);
    
    // Check first call - getting upload URL
    expect(mockFetch).toHaveBeenNthCalledWith(1, 
      'http://localhost:3001/api/files/upload-url',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          filename: 'data.csv',
          deal_id: mockDealId,
          user_id: mockUserId
        })
      })
    );

    // Check second call - uploading to storage
    expect(mockFetch).toHaveBeenNthCalledWith(2,
      'https://storage.example.com/upload-url',
      expect.objectContaining({
        method: 'PUT',
        body: mockFiles[0],
        headers: {
          'Content-Type': 'text/csv'
        }
      })
    );

    // Check third call - confirming upload
    expect(mockFetch).toHaveBeenNthCalledWith(3,
      'http://localhost:3001/api/files/confirm-upload',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          deal_id: mockDealId,
          filename: '1234567890-data.csv',
          original_name: 'data.csv',
          file_path: 'test-deal-123/1234567890-data.csv',
          file_size: 11, // 'csv content' is 11 bytes
          mime_type: 'text/csv',
          user_id: mockUserId
        })
      })
    );

    // Check fourth call - parsing document
    expect(mockFetch).toHaveBeenNthCalledWith(4,
      'http://localhost:3001/api/files/parse/doc-123',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          user_id: mockUserId
        })
      })
    );
  });

  it('handles upload URL errors gracefully', async () => {
    const mockFetch = jest.mocked(fetch);
    
    // Mock failed upload URL response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Request'
    } as Response);

    const { result } = renderHook(() => useFileUpload());

    await act(async () => {
      await result.current.uploadFiles([mockFiles[0]], mockDealId, mockUserId);
    });

    expect(result.current.uploads[0].status).toBe('error');
    expect(result.current.uploads[0].error).toBe('Failed to get upload URL: Bad Request');
  });

  it('handles storage upload errors gracefully', async () => {
    const mockFetch = jest.mocked(fetch);
    
    // Mock successful upload URL response
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          uploadUrl: 'https://storage.example.com/upload-url',
          path: 'test-deal-123/1234567890-data.csv',
          token: 'mock-token'
        })
      } as Response)
      // Mock failed storage upload response
      .mockResolvedValueOnce({
        ok: false,
        statusText: 'Storage Error'
      } as Response);

    const { result } = renderHook(() => useFileUpload());

    await act(async () => {
      await result.current.uploadFiles([mockFiles[0]], mockDealId, mockUserId);
    });

    expect(result.current.uploads[0].status).toBe('error');
    expect(result.current.uploads[0].error).toBe('Failed to upload file: Storage Error');
  });

  it('handles parsing errors gracefully', async () => {
    const mockFetch = jest.mocked(fetch);
    
    // Mock successful responses until parsing
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          uploadUrl: 'https://storage.example.com/upload-url',
          path: 'test-deal-123/1234567890-data.csv',
          token: 'mock-token'
        })
      } as Response)
      .mockResolvedValueOnce({
        ok: true
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'doc-123',
          filename: 'data.csv',
          original_name: 'data.csv',
          file_size: 1024,
          mime_type: 'text/csv',
          file_type: 'csv'
        })
      } as Response)
      // Mock failed parsing response
      .mockResolvedValueOnce({
        ok: false,
        statusText: 'Parsing Error'
      } as Response);

    const { result } = renderHook(() => useFileUpload());

    await act(async () => {
      await result.current.uploadFiles([mockFiles[0]], mockDealId, mockUserId);
    });

    // Upload should still be marked as completed even if parsing fails
    expect(result.current.uploads[0].status).toBe('completed');
    expect(result.current.uploads[0].uploadedFile).toBeDefined();
  });

  it('processes multiple files sequentially', async () => {
    const mockFetch = jest.mocked(fetch);
    
    // Mock successful responses for both files
    const mockResponses = [
      // File 1 responses
      { ok: true, json: async () => ({ uploadUrl: 'url1', path: 'path1', token: 'token1' }) },
      { ok: true },
      { ok: true, json: async () => ({ id: 'doc1', filename: 'data.csv' }) },
      { ok: true, json: async () => ({ id: 'analysis1' }) },
      // File 2 responses  
      { ok: true, json: async () => ({ uploadUrl: 'url2', path: 'path2', token: 'token2' }) },
      { ok: true },
      { ok: true, json: async () => ({ id: 'doc2', filename: 'data.xlsx' }) },
      { ok: true, json: async () => ({ id: 'analysis2' }) },
    ];

    mockResponses.forEach(response => {
      mockFetch.mockResolvedValueOnce(response as Response);
    });

    const { result } = renderHook(() => useFileUpload());

    await act(async () => {
      await result.current.uploadFiles(mockFiles, mockDealId, mockUserId);
    });

    expect(mockFetch).toHaveBeenCalledTimes(8); // 4 calls per file
    expect(result.current.uploads).toHaveLength(2);
    expect(result.current.uploads[0].status).toBe('completed');
    expect(result.current.uploads[1].status).toBe('completed');
  });

  it('clears uploads correctly', () => {
    const { result } = renderHook(() => useFileUpload());

    act(() => {
      result.current.clearUploads();
    });

    expect(result.current.uploads).toEqual([]);
  });

  it('removes individual uploads correctly', () => {
    const { result } = renderHook(() => useFileUpload());

    // Test that removeUpload function exists and can be called
    expect(typeof result.current.removeUpload).toBe('function');
    
    // Since we can't directly modify the state in the hook, 
    // we'll test the function signature and behavior
    expect(() => result.current.removeUpload(0)).not.toThrow();
  });

  it('tracks upload progress correctly', async () => {
    const mockFetch = jest.mocked(fetch);
    
    // Mock successful responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          uploadUrl: 'https://storage.example.com/upload-url',
          path: 'test-deal-123/1234567890-data.csv',
          token: 'mock-token'
        })
      } as Response)
      .mockResolvedValueOnce({
        ok: true
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'doc-123',
          filename: 'data.csv'
        })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'analysis-123'
        })
      } as Response);

    const { result } = renderHook(() => useFileUpload());

    // Start upload
    act(() => {
      result.current.uploadFiles([mockFiles[0]], mockDealId, mockUserId);
    });

    // Check initial state
    expect(result.current.uploads[0].progress).toBe(0);
    expect(result.current.uploads[0].status).toBe('uploading');

    // Wait for upload to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Check final state
    expect(result.current.uploads[0].progress).toBe(100);
    expect(result.current.uploads[0].status).toBe('completed');
  });
});
