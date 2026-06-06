import { z } from '@/lib/zod';
import { expandErrorResponses } from '@/utils/errors/expand-error-responses';
import { errorSchema } from '../common.schema';
import { championshipIdParamsSchema, championshipSchema } from './championship.schema';

const getChampionshipResponseSchema = z.object({
  data: z.object({
    championship: championshipSchema,
  }),
});

export const getChampionshipSchema = {
  tags: ['Championships'],
  summary: 'Buscar campeonato',
  operationId: 'getChampionship',
  security: [{ bearerAuth: [] }],
  params: championshipIdParamsSchema,
  response: expandErrorResponses(
    { 200: getChampionshipResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema }
  ),
};

export type GetChampionshipParams = z.infer<typeof getChampionshipSchema.params>;
