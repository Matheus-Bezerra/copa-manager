import { z } from '@/lib/zod';
import { expandErrorResponses } from '@/utils/errors/expand-error-responses';
import { errorSchema } from '../common.schema';
import { championshipIdParamsSchema } from './championship.schema';

export const deleteChampionshipSchema = {
  tags: ['Championships'],
  summary: 'Excluir campeonato',
  operationId: 'deleteChampionship',
  security: [{ bearerAuth: [] }],
  params: championshipIdParamsSchema,
  response: expandErrorResponses({ 204: z.null() }, { '4xx': errorSchema, '5xx': errorSchema }),
};

export type DeleteChampionshipParams = z.infer<typeof deleteChampionshipSchema.params>;
