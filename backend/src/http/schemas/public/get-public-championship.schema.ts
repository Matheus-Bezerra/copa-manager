import { z } from '@/lib/zod';
import { expandErrorResponses } from '@/utils/errors/expand-error-responses';
import { errorSchema } from '../common.schema';
import { publicChampionshipSchema } from '../championships/championship.schema';

const getPublicChampionshipResponseSchema = z.object({
  data: z.object({
    championship: publicChampionshipSchema,
  }),
});

export const getPublicChampionshipSchema = {
  tags: ['Public'],
  summary: 'Buscar campeonato público',
  operationId: 'getPublicChampionship',
  params: z.object({
    slug: z.string().min(1),
  }),
  response: expandErrorResponses(
    { 200: getPublicChampionshipResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema }
  ),
};

export type GetPublicChampionshipParams = z.infer<typeof getPublicChampionshipSchema.params>;
