import { z } from '@/lib/zod';
import { expandErrorResponses } from '@/utils/errors/expand-error-responses';
import { errorSchema } from '../common.schema';
import {
  championshipDescriptionSchema,
  championshipNameSchema,
  championshipSchema,
  dateInputSchema,
} from './championship.schema';

const createChampionshipResponseSchema = z.object({
  data: z.object({
    championship: championshipSchema,
  }),
});

export const createChampionshipSchema = {
  tags: ['Championships'],
  summary: 'Criar campeonato',
  operationId: 'createChampionship',
  security: [{ bearerAuth: [] }],
  body: z.object({
    name: championshipNameSchema,
    description: championshipDescriptionSchema,
    startDate: dateInputSchema,
    endDate: dateInputSchema,
  }),
  response: expandErrorResponses(
    { 201: createChampionshipResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema }
  ),
};

export type CreateChampionshipBody = z.infer<typeof createChampionshipSchema.body>;
