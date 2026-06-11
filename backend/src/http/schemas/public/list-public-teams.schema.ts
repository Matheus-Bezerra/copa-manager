import { z } from '@/lib/zod'
import { expandErrorResponses } from '@/utils/errors/expand-error-responses'
import { errorSchema } from '../common.schema'

const slugParamsSchema = z.object({
  slug: z.string().min(1),
})

export const publicTeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string().nullable(),
  logoUrl: z.string().nullable(),
  primaryColor: z.string().nullable(),
  secondaryColor: z.string().nullable(),
})

export const listPublicTeamsSchema = {
  tags: ['Public'],
  summary: 'Times públicos do campeonato',
  operationId: 'listPublicTeams',
  params: slugParamsSchema,
  response: expandErrorResponses(
    { 200: z.object({ data: z.object({ teams: z.array(publicTeamSchema) }) }) },
    { '4xx': errorSchema, '5xx': errorSchema },
  ),
}

export type ListPublicTeamsParams = z.infer<typeof listPublicTeamsSchema.params>
