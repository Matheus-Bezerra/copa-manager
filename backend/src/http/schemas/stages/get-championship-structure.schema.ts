import { z } from '@/lib/zod'
import { expandErrorResponses } from '@/utils/errors/expand-error-responses'
import { errorSchema } from '../common.schema'
import { championshipIdParamsSchema, stageWithStructureSchema } from './stage.schema'

const getChampionshipStructureResponseSchema = z.object({
  data: z.object({
    stages: z.array(stageWithStructureSchema),
  }),
})

export const getChampionshipStructureSchema = {
  tags: ['Stages'],
  summary: 'Estrutura completa do campeonato (fases + grupos + rodadas)',
  operationId: 'getChampionshipStructure',
  security: [{ bearerAuth: [] }],
  params: championshipIdParamsSchema,
  response: expandErrorResponses(
    { 200: getChampionshipStructureResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema },
  ),
}

export type GetChampionshipStructureParams = z.infer<typeof getChampionshipStructureSchema.params>
