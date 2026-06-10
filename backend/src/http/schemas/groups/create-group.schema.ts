import { z } from '@/lib/zod'
import { expandErrorResponses } from '@/utils/errors/expand-error-responses'
import { errorSchema } from '../common.schema'
import { championshipIdStageIdParamsSchema, groupSchema } from '../stages/stage.schema'

const createGroupResponseSchema = z.object({
  data: z.object({
    group: groupSchema,
  }),
})

export const createGroupSchema = {
  tags: ['Groups'],
  summary: 'Criar grupo em uma fase GROUP_STAGE',
  operationId: 'createGroup',
  security: [{ bearerAuth: [] }],
  params: championshipIdStageIdParamsSchema,
  body: z.object({
    name: z.string().trim().min(1).max(100),
  }),
  response: expandErrorResponses(
    { 201: createGroupResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema },
  ),
}

export type CreateGroupParams = z.infer<typeof createGroupSchema.params>
export type CreateGroupBody = z.infer<typeof createGroupSchema.body>
