import { z } from '@/lib/zod';
import { expandErrorResponses } from '@/utils/errors/expand-error-responses';
import { errorSchema } from '../common.schema';
import {
  championshipDescriptionSchema,
  championshipIdParamsSchema,
  championshipNameSchema,
  championshipSchema,
  championshipStatusSchema,
  dateInputSchema,
} from './championship.schema';

const updateChampionshipResponseSchema = z.object({
  data: z.object({
    championship: championshipSchema,
  }),
});

export const updateChampionshipSchema = {
  tags: ['Championships'],
  summary: 'Atualizar campeonato',
  operationId: 'updateChampionship',
  security: [{ bearerAuth: [] }],
  params: championshipIdParamsSchema,
  body: z.object({
    name: championshipNameSchema.optional(),
    description: championshipDescriptionSchema,
    regulations: z.string().trim().optional().nullable(),
    startDate: dateInputSchema.optional(),
    endDate: dateInputSchema.optional(),
    status: championshipStatusSchema.optional(),
  }),
  response: expandErrorResponses(
    { 200: updateChampionshipResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema }
  ),
};

export type UpdateChampionshipParams = z.infer<typeof updateChampionshipSchema.params>;
export type UpdateChampionshipBody = z.infer<typeof updateChampionshipSchema.body>;
