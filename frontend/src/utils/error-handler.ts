import type { AxiosError } from 'axios';

import type { ApiErrorResponse } from '@/http/types/api-error';

type ErrorHandlerResult = {
  code: string;
  description: string;
};

export function errorHandler(error: unknown): ErrorHandlerResult {
  const axiosError = error as AxiosError<ApiErrorResponse>;

  if (axiosError.response?.data?.error) {
    const { code, message } = axiosError.response.data.error;

    return {
      code,
      description: message,
    };
  }

  if (axiosError.message) {
    return {
      code: 'REQUEST_FAILED',
      description: axiosError.message,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    description: 'Ocorreu um erro inesperado.',
  };
}
