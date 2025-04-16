import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Error types for consistent error handling
 */
export enum ErrorType {
  Network = 'NETWORK_ERROR',
  Auth = 'AUTH_ERROR',
  Permission = 'PERMISSION_ERROR',
  NotFound = 'NOT_FOUND_ERROR',
  Validation = 'VALIDATION_ERROR',
  DataOperation = 'DATA_OPERATION_ERROR',
  Security = 'SECURITY_ERROR',
  General = 'GENERAL_ERROR',
}

/**
 * Interface for structured error objects
 */
export interface AppError {
  type: ErrorType;
  message: string;
  details?: string;
  originalError?: any;
}

/**
 * Hook for consistent error handling throughout the application
 */
export const useErrorHandler = () => {
  const [error, setError] = useState<AppError | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * Clear the current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Handle errors in a consistent way
   * @param err - The error to handle
   * @param context - Additional context for the error
   */
  const handleError = useCallback((
    err: any, 
    context: {
      showToast?: boolean;
      notifyUser?: boolean;
      logToConsole?: boolean;
      logToService?: boolean;
      defaultMessage?: string;
      type?: ErrorType;
    } = {}
  ) => {
    const {
      showToast = true,
      notifyUser = true,
      logToConsole = true,
      logToService = process.env.NODE_ENV === 'production',
      defaultMessage = 'An unexpected error occurred',
      type = ErrorType.General
    } = context;

    // Determine the error message
    let errorMessage = defaultMessage;
    let errorDetails: string | undefined;
    let errorType = type;

    // Try to extract meaningful information from different error types
    if (err) {
      // Handle Supabase errors
      if (err.code && err.message) {
        errorMessage = err.message;
        
        // Map specific Supabase error codes to our error types
        if (err.code.startsWith('PGRST')) {
          errorType = ErrorType.DataOperation;
        } else if (err.code.startsWith('AUTH')) {
          errorType = ErrorType.Auth;
        } else if (err.code === '23505') { // Unique constraint violation
          errorType = ErrorType.Validation;
        } else if (err.code === '42501') { // Permission error
          errorType = ErrorType.Permission;
        }
      }
      // Handle standard Error objects
      else if (err instanceof Error) {
        errorMessage = err.message;
        errorDetails = err.stack;
        
        // Network errors
        if (err.name === 'NetworkError' || err.message.includes('network')) {
          errorType = ErrorType.Network;
        }
      }
      // Handle string errors
      else if (typeof err === 'string') {
        errorMessage = err;
      }
      // Handle unknown error types
      else {
        try {
          errorDetails = JSON.stringify(err, null, 2);
        } catch (e) {
          errorDetails = 'Error could not be serialized';
        }
      }
    }

    // Create structured error object
    const appError: AppError = {
      type: errorType,
      message: errorMessage,
      details: errorDetails,
      originalError: err,
    };

    // Set the error state
    setError(appError);

    // Log to console if needed
    if (logToConsole) {
      console.error(`[${errorType}] ${errorMessage}`, err);
    }

    // Show toast notification if needed
    if (showToast && notifyUser) {
      toast.error(errorMessage);
    }

    // Log to error tracking service in production
    if (logToService) {
      // This is where you would integrate with a service like Sentry, LogRocket, etc.
      // Example with Sentry:
      // Sentry.captureException(err, {
      //   level: 'error',
      //   extra: {
      //     type: errorType,
      //     details: errorDetails,
      //   }
      // });
    }

    return appError;
  }, []);

  /**
   * Execute an async function with error handling and loading state
   * @param fn - The async function to execute
   * @param errorOptions - Options for error handling
   * @returns A promise that resolves to the result of the function
   */
  const executeWithErrorHandling = useCallback(async <T>(
    fn: () => Promise<T>,
    errorOptions: {
      showToast?: boolean;
      notifyUser?: boolean;
      defaultMessage?: string;
      type?: ErrorType;
    } = {}
  ): Promise<T | null> => {
    clearError();
    setLoading(true);
    
    try {
      const result = await fn();
      setLoading(false);
      return result;
    } catch (err) {
      handleError(err, errorOptions);
      setLoading(false);
      return null;
    }
  }, [handleError, clearError]);

  return {
    error,
    loading,
    clearError,
    handleError,
    executeWithErrorHandling,
  };
};

/**
 * Create a default error handler for use in components
 * @param error - The error to handle
 * @param options - Options for error handling
 */
export const handleGlobalError = (
  error: any,
  options: {
    showToast?: boolean;
    defaultMessage?: string;
    type?: ErrorType;
  } = {}
) => {
  const {
    showToast = true,
    defaultMessage = 'An unexpected error occurred',
    type = ErrorType.General
  } = options;

  // Determine error message
  let errorMessage = defaultMessage;
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  // Log error
  console.error(`[${type}] ${errorMessage}`, error);

  // Show toast notification
  if (showToast) {
    toast.error(errorMessage);
  }

  // In production, you would log to a service here
  if (process.env.NODE_ENV === 'production') {
    // Sentry.captureException(error);
  }
}; 