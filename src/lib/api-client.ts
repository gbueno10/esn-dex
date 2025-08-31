/**
 * API Error Handling Utilities
 * Provides standardized error handling and user-friendly messages
 */

export interface ApiError {
  error: string;
  code?: string;
  retryable?: boolean;
  timestamp?: string;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  code?: string;
  retryable?: boolean;
  message?: string;
}

/**
 * Enhanced fetch wrapper with better error handling
 */
export async function apiCall<T = any>(
  url: string,
  options: RequestInit = {},
  retries: number = 3
): Promise<T> {
  const {
    headers = {},
    ...restOptions
  } = options;

  // Default headers
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  let lastError: Error;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...restOptions,
        headers: defaultHeaders,
      });

      // Parse response
      let data: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Handle HTTP errors
      if (!response.ok) {
        const apiError: ApiError = {
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
          code: data.code || `HTTP_${response.status}`,
          retryable: data.retryable || isRetryableStatus(response.status),
          timestamp: data.timestamp || new Date().toISOString(),
        };

        // Don't retry non-retryable errors
        if (!apiError.retryable || attempt === retries) {
          throw new ApiCallError(apiError, response.status);
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }

      return data;

    } catch (error) {
      lastError = error as Error;

      // Don't retry network errors on last attempt
      if (attempt === retries) {
        if (error instanceof ApiCallError) {
          throw error;
        }

        throw new ApiCallError({
          error: 'Network error. Please check your connection.',
          code: 'NETWORK_ERROR',
          retryable: true,
          timestamp: new Date().toISOString(),
        });
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  throw lastError!;
}

/**
 * Custom error class for API calls
 */
export class ApiCallError extends Error {
  public readonly apiError: ApiError;
  public readonly statusCode?: number;

  constructor(apiError: ApiError, statusCode?: number) {
    super(apiError.error);
    this.name = 'ApiCallError';
    this.apiError = apiError;
    this.statusCode = statusCode;
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    const { code, error } = this.apiError;

    switch (code) {
      case 'AUTH_REQUIRED':
        return 'Please sign in to continue.';
      case 'PERMISSION_DENIED':
      case 'FORBIDDEN':
        return 'You do not have permission to perform this action.';
      case 'USER_NOT_FOUND':
        return 'The requested profile was not found.';
      case 'NETWORK_ERROR':
        return 'Connection problem. Please check your internet connection.';
      case 'INVALID_NAME':
        return 'Please enter a valid name.';
      case 'MISSING_REQUIRED_FIELDS':
        return 'Please fill in all required fields.';
      case 'USER_EXISTS':
        return 'This user already exists.';
      default:
        return error || 'Something went wrong. Please try again.';
    }
  }

  /**
   * Check if this error is retryable
   */
  isRetryable(): boolean {
    return this.apiError.retryable || false;
  }
}

/**
 * Check if HTTP status code is retryable
 */
function isRetryableStatus(status: number): boolean {
  return [
    408, // Request Timeout
    429, // Too Many Requests
    500, // Internal Server Error
    502, // Bad Gateway
    503, // Service Unavailable
    504, // Gateway Timeout
  ].includes(status);
}

/**
 * Create authenticated headers
 */
export async function createAuthHeaders(user?: any): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (user) {
    try {
      const token = await user.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      console.error('Failed to get auth token:', error);
    }
  }

  return headers;
}

/**
 * Higher-order component for handling API errors in React components
 */
export function withRetry<T extends (...args: any[]) => Promise<any>>(
  apiFunction: T,
  maxRetries: number = 3
): T {
  return (async (...args: any[]) => {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiFunction(...args);
      } catch (error) {
        lastError = error as Error;

        if (error instanceof ApiCallError && !error.isRetryable()) {
          throw error;
        }

        if (attempt === maxRetries) {
          throw error;
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw lastError!;
  }) as T;
}

/**
 * Error boundary hook for React components
 */
export function useApiErrorHandler() {
  const handleError = (error: unknown): string => {
    if (error instanceof ApiCallError) {
      return error.getUserMessage();
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  };

  const showRetryOption = (error: unknown): boolean => {
    if (error instanceof ApiCallError) {
      return error.isRetryable();
    }

    return true; // Default to retryable for unknown errors
  };

  return { handleError, showRetryOption };
}
