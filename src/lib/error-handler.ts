export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'You do not have permission to perform this action') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR');
    this.name = 'DatabaseError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network request failed') {
    super(message, 503, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

export function handleApiError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Handle specific error types
    if (error.name === 'ValidationError') {
      return new ValidationError(error.message);
    }
    if (error.name === 'CastError') {
      return new ValidationError('Invalid ID format');
    }
    if (error.name === 'MongoError') {
      return new DatabaseError('Database operation failed');
    }
    
    return new AppError(error.message, 500);
  }

  return new AppError('An unexpected error occurred', 500);
}

export function formatErrorResponse(error: AppError) {
  return {
    success: false,
    error: {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    },
  };
}

export function logError(error: unknown, context?: string) {
  const timestamp = new Date().toISOString();
  const contextStr = context ? `[${context}]` : '';
  
  if (error instanceof Error) {
    console.error(`${timestamp} ${contextStr} Error:`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  } else {
    console.error(`${timestamp} ${contextStr} Unknown error:`, error);
  }
}
