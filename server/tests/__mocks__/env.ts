// Mock environment configuration for testing
export const env = {
  NODE_ENV: 'test',
  PORT: '3002',
  ENABLE_MOCK_MODE: true,
  ENABLE_DATABASE: false,
  ENABLE_ANALYSIS: false,
  ENABLE_EXPORT: false,
  ENABLE_QA: false,
  ENABLE_RAG: false,
  ENABLE_EMBEDDINGS: false,
  SUPABASE_URL: 'http://localhost:54321',
  SUPABASE_ANON_KEY: 'test-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
  ANTHROPIC_API_KEY: 'test-api-key'
};

export const logEnvironmentConfig = jest.fn();
