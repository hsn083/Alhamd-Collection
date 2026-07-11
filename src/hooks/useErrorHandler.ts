'use client';

import { toast } from 'sonner';

export function useErrorHandler() {
  const handleError = (error: unknown, context?: string) => {
    console.error(`[Error${context ? ` - ${context}` : ''}]:`, error);

    if (error instanceof Error) {
      toast.error(error.message || 'An error occurred');
    } else if (typeof error === 'string') {
      toast.error(error);
    } else {
      toast.error('An unexpected error occurred');
    }
  };

  const handleSuccess = (message: string) => {
    toast.success(message);
  };

  const handleInfo = (message: string) => {
    toast.info(message);
  };

  const handleWarning = (message: string) => {
    toast.warning(message);
  };

  return {
    handleError,
    handleSuccess,
    handleInfo,
    handleWarning,
  };
}
