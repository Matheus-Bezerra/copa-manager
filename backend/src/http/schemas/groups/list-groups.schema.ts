import { z } from '@/lib/zod'
import { expandErrorResponses } from '@/utils/errors/expand-error-responses'
import { errorSchema } from '../common.schema'
import { championshipIdStageIdParamsSchema, groupSchema } from '../stages/stage.schema'

const listGroupsResponseSchema = z.object({
  data: z.array(groupSchema),
})

export const listGroupsSchema = {
  tags: ['Groups'],
  summary: 'Listar grupos de uma fase',
  operationId: 'listGroups',
  security: [{ bearerAuth: [] }],
  params: championshipIdStageIdParamsSchema,
  response: expandErrorResponses(
    { 200: listGroupsResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema },
  ),
}

export type ListGroupsParams = z.infer<typeof listGroupsSchema.params>
