import { z } from '@/lib/zod';
import { expandErrorResponses } from '@/utils/errors/expand-error-responses';
import { errorSchema } from '../common.schema';
import { championshipSchema } from './championship.schema';

const listChampionshipsResponseSchema = z.object({
  data: z.object({
    championships: z.array(championshipSchema),
  }),
});

export const listChampionshipsSchema = {
  tags: ['Championships'],
  summary: 'Listar campeonatos',
  operationId: 'listChampionships',
  security: [{ bearerAuth: [] }],
  response: expandErrorResponses(
    { 200: listChampionshipsResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema }
  ),
};
