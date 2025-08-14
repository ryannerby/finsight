import { AnalysisErrorHandler } from './errorHandler';

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operation: string
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Timeout')) {
      throw AnalysisErrorHandler.createTimeoutError(operation);
    }
    throw error;
  }
}

// Default timeouts for different operations
export const TIMEOUTS = {
  AI_SUMMARY: 30000, // 30 seconds for summary generation
  AI_CHECKLIST: 20000, // 20 seconds for checklist generation
  FILE_PROCESSING: 15000, // 15 seconds for file processing
  METRICS_COMPUTATION: 10000, // 10 seconds for metrics computation
} as const; 