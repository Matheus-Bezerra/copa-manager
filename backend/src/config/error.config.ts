import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { errorMessage } from '@/constants/error-message';
import { formatError, toErrorResponse } from '@/utils/errors/format-error';
import { formatValidationErrorMessage } from '@/utils/errors/format-validation-errors';
import { logger } from '@/utils/logger';

export function errorHandler(error: FastifyError, _request: FastifyRequest, reply: FastifyReply) {
  if (error.validation) {
    return reply.status(errorMessage.validationFieldError.statusCode).send(
      toErrorResponse({
        ...errorMessage.validationFieldError,
        message: formatValidationErrorMessage(error),
      })
    );
  }

  if (error.code === 'FST_ERR_RESPONSE_SERIALIZATION') {
    logger.error('Response serialization error', error);

    return reply
      .status(errorMessage.serializationError.statusCode)
      .send(toErrorResponse(errorMessage.serializationError));
  }

  if (isAppError(error)) {
    return reply.status(error.statusCode).send(toErrorResponse(error));
  }

  logger.error('Unhandled error', error);

  const { statusCode, code, message } = formatError(error);

  return reply.status(statusCode).send({ code, message });
}

function isAppError(error: unknown): error is { code: string; message: string; statusCode: number } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'statusCode' in error
  );
}
