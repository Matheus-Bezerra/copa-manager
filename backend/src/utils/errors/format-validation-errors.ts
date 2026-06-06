import type { FastifyError } from 'fastify';
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod';
import { errorMessage } from '@/constants/error-message';

export function formatValidationErrorMessage(error: FastifyError): string {
  if (!hasZodFastifySchemaValidationErrors(error)) {
    const firstValidationMessage = error.validation?.[0]?.message;

    if (typeof firstValidationMessage === 'string' && firstValidationMessage.length > 0) {
      return firstValidationMessage;
    }

    return errorMessage.validationFieldError.message;
  }

  return error.validation
    .map((issue) => {
      const field = issue.instancePath.replace(/^\//, '') || 'body';

      return field ? `${field}: ${issue.message}` : issue.message;
    })
    .join('; ');
}
