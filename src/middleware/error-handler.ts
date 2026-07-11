import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, formatErrorResponse, logError } from '@/lib/error-handler';

export function withErrorHandler(
  handler: (req: NextRequest) => Promise<NextResponse>,
  context: string = 'API'
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(req);
    } catch (error) {
      logError(error, context);
      const appError = handleApiError(error);
      return NextResponse.json(formatErrorResponse(appError), {
        status: appError.statusCode,
      });
    }
  };
}
