import { expandErrorResponses } from '@/utils/errors/expand-error-responses';
import { errorSchema } from '../common.schema';
import { currentUserResponseSchema } from '../auth/user.schema';

export const getCurrentUserSchema = {
  tags: ['User'],
  summary: 'Obter usuário autenticado',
  operationId: 'getCurrentUser',
  security: [{ bearerAuth: [] }],
  response: expandErrorResponses(
    { 200: currentUserResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema }
  ),
};
