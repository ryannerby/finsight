import { z } from 'zod';
import { logger } from './logger';

// Define the environment schema
const envSchema = z.object({
  // Server configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001'),
  
  // Database configuration
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  
  // External services
  ANTHROPIC_API_KEY: z.string().optional(),
  
  // Puppeteer configuration
  PUPPETEER_EXECUTABLE_PATH: z.string().optional(),
  
  // Feature flags (boolean only - never echo secrets)
  ENABLE_MOCK_MODE: z.boolean().default(false),
  ENABLE_DATABASE: z.boolean().default(true),
  ENABLE_ANALYSIS: z.boolean().default(true),
  ENABLE_EXPORT: z.boolean().default(true),
  ENABLE_QA: z.boolean().default(true),
  ENABLE_RAG: z.boolean().default(false),
  ENABLE_EMBEDDINGS: z.boolean().default(false),
});

// Parse and validate environment variables
export const env = envSchema.parse({
  ...process.env,
  // Convert string env vars to boolean for feature flags
  ENABLE_MOCK_MODE: process.env.ENABLE_MOCK_MODE === 'true',
  ENABLE_DATABASE: process.env.ENABLE_DATABASE !== 'false',
  ENABLE_ANALYSIS: process.env.ENABLE_ANALYSIS !== 'false',
  ENABLE_EXPORT: process.env.ENABLE_EXPORT !== 'false',
  ENABLE_QA: process.env.ENABLE_QA !== 'false',
});

// Log environment configuration (only boolean flags, never secrets)
export function logEnvironmentConfig(): void {
  const config = {
    NODE_ENV: env.NODE_ENV,
    PORT: env.PORT,
    ENABLE_MOCK_MODE: env.ENABLE_MOCK_MODE,
    ENABLE_DATABASE: env.ENABLE_DATABASE,
    ENABLE_ANALYSIS: env.ENABLE_ANALYSIS,
    ENABLE_EXPORT: env.ENABLE_EXPORT,
    ENABLE_QA: env.ENABLE_QA,
    ENABLE_RAG: env.ENABLE_RAG,
    ENABLE_EMBEDDINGS: env.ENABLE_EMBEDDINGS,
  };

  logger.info('Environment configuration loaded', config);
  
  // Log warnings for missing optional but recommended variables
  if (!env.SUPABASE_URL) {
    logger.warn('SUPABASE_URL not set - database features will be disabled');
  }
  if (!env.ANTHROPIC_API_KEY) {
    logger.warn('ANTHROPIC_API_KEY not set - AI analysis features will be disabled');
  }
}
