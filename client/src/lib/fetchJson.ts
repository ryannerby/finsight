export interface FetchError {
  status: number;
  message: string;
  requestId?: string;
  type?: string;
}

export interface FetchOptions extends RequestInit {
  timeout?: number;
}

/**
 * Centralized fetch utility with consistent error handling
 * Throws structured errors with status, message, and requestId
 */
export async function fetchJson<T = any>(
  url: string, 
  options: FetchOptions = {}
): Promise<T> {
  const { timeout = 10000, ...fetchOptions } = options;
  
  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });
    
    clearTimeout(timeoutId);
    
    // Get request ID from response headers
    const requestId = response.headers.get('x-request-id');
    
    if (!response.ok) {
      let errorData: any = {};
      
      try {
        // Try to parse error response
        errorData = await response.json();
      } catch {
        // Fallback if response isn't JSON
        errorData = { message: 'Unknown error occurred' };
      }
      
      const error: FetchError = {
        status: response.status,
        message: errorData.error?.message || errorData.message || getDefaultErrorMessage(response.status),
        requestId,
        type: errorData.error?.type,
      };
      
      throw error;
    }
    
    // Parse successful response
    try {
      return await response.json();
    } catch (error) {
      throw {
        status: 0,
        message: 'Failed to parse response as JSON',
        requestId,
      } as FetchError;
    }
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw {
          status: 0,
          message: 'Request timed out',
        } as FetchError;
      }
      
      // Network or other fetch errors
      throw {
        status: 0,
        message: error.message || 'Network error occurred',
      } as FetchError;
    }
    
    // Re-throw our structured errors
    throw error;
  }
}

/**
 * Get user-friendly error messages for common HTTP status codes
 */
function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'Authentication required. Please log in and try again.';
    case 403:
      return 'Access denied. You don\'t have permission to perform this action.';
    case 404:
      return 'Resource not found. Please check the URL and try again.';
    case 409:
      return 'Conflict. The resource has been modified by another user.';
    case 422:
      return 'Validation failed. Please check your input and try again.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Server error. Please try again later or contact support.';
    case 502:
      return 'Bad gateway. The server is temporarily unavailable.';
    case 503:
      return 'Service unavailable. Please try again later.';
    case 504:
      return 'Gateway timeout. The request took too long to complete.';
    default:
      return `Request failed with status ${status}. Please try again.`;
  }
}

/**
 * Helper function for GET requests
 */
export function getJson<T = any>(url: string, options?: FetchOptions): Promise<T> {
  return fetchJson<T>(url, { ...options, method: 'GET' });
}

/**
 * Helper function for POST requests
 */
export function postJson<T = any>(url: string, data?: any, options?: FetchOptions): Promise<T> {
  return fetchJson<T>(url, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * Helper function for PUT requests
 */
export function putJson<T = any>(url: string, data?: any, options?: FetchOptions): Promise<T> {
  return fetchJson<T>(url, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * Helper function for DELETE requests
 */
export function deleteJson<T = any>(url: string, options?: FetchOptions): Promise<T> {
  return fetchJson<T>(url, { ...options, method: 'DELETE' });
}

/**
 * Helper function for PATCH requests
 */
export function patchJson<T = any>(url: string, data?: any, options?: FetchOptions): Promise<T> {
  return fetchJson<T>(url, {
    ...options,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}
