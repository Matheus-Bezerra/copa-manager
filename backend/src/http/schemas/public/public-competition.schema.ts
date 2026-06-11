import { z } from '@/lib/zod'
import { expandErrorResponses } from '@/utils/errors/expand-error-responses'
import { errorSchema } from '../common.schema'
import { matchListItemSchema, matchStatusSchema } from '../matches/match.schema'
import { standingEntrySchema } from '../standings/standing.schema'
import { stageWithStructureSchema } from '../stages/stage.schema'

const slugParamsSchema = z.object({
  slug: z.string().min(1),
})

export const getPublicStructureSchema = {
  tags: ['Public'],
  summary: 'Estrutura pública do campeonato (fases + grupos + rodadas)',
  operationId: 'getPublicStructure',
  params: slugParamsSchema,
  response: expandErrorResponses(
    { 200: z.object({ data: z.object({ stages: z.array(stageWithStructureSchema) }) }) },
    { '4xx': errorSchema, '5xx': errorSchema },
  ),
}

export const getPublicStandingsSchema = {
  tags: ['Public'],
  summary: 'Classificação pública por fase e grupo',
  operationId: 'getPublicStandings',
  params: slugParamsSchema,
  querystring: z.object({
    stageId: z.string().min(1),
    groupId: z.string().min(1),
  }),
  response: expandErrorResponses(
    { 200: z.object({ data: z.array(standingEntrySchema) }) },
    { '4xx': errorSchema, '5xx': errorSchema },
  ),
}

export const listPublicMatchesSchema = {
  tags: ['Public'],
  summary: 'Partidas públicas do campeonato',
  operationId: 'listPublicMatches',
  params: slugParamsSchema,
  querystring: z.object({
    roundId: z.string().min(1).optional(),
    groupId: z.string().min(1).optional(),
    status: matchStatusSchema.optional(),
  }),
  response: expandErrorResponses(
    { 200: z.object({ data: z.array(matchListItemSchema) }) },
    { '4xx': errorSchema, '5xx': errorSchema },
  ),
}

export type GetPublicStructureParams = z.infer<typeof getPublicStructureSchema.params>
export type GetPublicStandingsParams = z.infer<typeof getPublicStandingsSchema.params>
export type GetPublicStandingsQuery = z.infer<typeof getPublicStandingsSchema.querystring>
export type ListPublicMatchesParams = z.infer<typeof listPublicMatchesSchema.params>
export type ListPublicMatchesQuery = z.infer<typeof listPublicMatchesSchema.querystring>
