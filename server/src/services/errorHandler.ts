export interface AnalysisError {
  type: 'rate_limit' | 'timeout' | 'ai_error' | 'file_too_large' | 'invalid_data' | 'unknown';
  message: string;
  details?: any;
  retryAfter?: number; // seconds
}

export class AnalysisErrorHandler {
  static createRateLimitError(retryAfter: number): AnalysisError {
    return {
      type: 'rate_limit',
      message: 'Analysis is limited to once per minute per deal',
      retryAfter
    };
  }

  static createTimeoutError(operation: string): AnalysisError {
    return {
      type: 'timeout',
      message: `Operation timed out: ${operation}`,
      details: { operation }
    };
  }

  static createAIError(error: any): AnalysisError {
    return {
      type: 'ai_error',
      message: 'AI service error occurred',
      details: {
        originalError: error?.message || String(error),
        code: error?.code,
        status: error?.status
      }
    };
  }

  static createFileTooLargeError(fileSize: number, maxSize: number): AnalysisError {
    return {
      type: 'file_too_large',
      message: `File size ${(fileSize / 1024 / 1024).toFixed(1)}MB exceeds maximum size of ${(maxSize / 1024 / 1024).toFixed(1)}MB`,
      details: { fileSize, maxSize }
    };
  }

  static createInvalidDataError(operation: string, details?: any): AnalysisError {
    return {
      type: 'invalid_data',
      message: `Invalid data in ${operation}`,
      details
    };
  }

  static createUnknownError(error: any): AnalysisError {
    return {
      type: 'unknown',
      message: 'An unexpected error occurred',
      details: {
        originalError: error?.message || String(error),
        stack: error?.stack
      }
    };
  }

  static isRetryableError(error: AnalysisError): boolean {
    return ['timeout', 'ai_error'].includes(error.type);
  }

  static getHttpStatus(error: AnalysisError): number {
    switch (error.type) {
      case 'rate_limit':
        return 429; // Too Many Requests
      case 'file_too_large':
        return 413; // Payload Too Large
      case 'invalid_data':
        return 400; // Bad Request
      case 'timeout':
      case 'ai_error':
        return 503; // Service Unavailable
      default:
        return 500; // Internal Server Error
    }
  }
} 