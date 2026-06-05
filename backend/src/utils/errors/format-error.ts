import { errorMessage, type AppError } from '@/constants/error-message';

export type ErrorResponseBody = {
  statusCode: number;
  code: string;
  message: string;
};

export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'statusCode' in error &&
    typeof (error as AppError).code === 'string' &&
    typeof (error as AppError).message === 'string' &&
    typeof (error as AppError).statusCode === 'number'
  );
}

export function formatError(error: unknown): ErrorResponseBody {
  if (isAppError(error)) {
    return {
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
    };
  }

  return {
    statusCode: errorMessage.internalServerError.statusCode,
    code: errorMessage.internalServerError.code,
    message: errorMessage.internalServerError.message,
  };
}

export function toErrorResponse(error: AppError): Pick<ErrorResponseBody, 'code' | 'message'> {
  return {
    code: error.code,
    message: error.message,
  };
}
