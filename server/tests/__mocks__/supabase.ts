// Mock Supabase configuration for testing
export const supabase = {
  from: jest.fn((table: string) => ({
    select: jest.fn((columns?: string) => ({
      eq: jest.fn((column: string, value: any) => ({
        single: jest.fn(() => {
          if (table === 'deals' && value === 'non-existent-id') {
            return { data: null, error: { code: 'PGRST116', message: 'No rows returned' } };
          }
          if (table === 'analysis_reports' && value === 'non-existent-id') {
            return { data: null, error: { code: 'PGRST116', message: 'No rows returned' } };
          }
          return { data: { id: 'test-id' }, error: null };
        }),
        limit: jest.fn(() => ({ data: [], error: null })),
        order: jest.fn(() => ({ data: [], error: null }))
      }))
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => ({ data: { id: 'test-id' }, error: null }))
      }))
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => ({
        eq: jest.fn(() => ({ data: null, error: null }))
      }))
    }))
  }))
};

export const supabaseAdmin = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => ({ data: null, error: null })),
        limit: jest.fn(() => ({ data: [], error: null }))
      }))
    }))
  })),
  storage: {
    from: jest.fn(() => ({
      list: jest.fn(() => ({ data: [], error: null })),
      remove: jest.fn(() => ({ data: null, error: null }))
    }))
  }
};
