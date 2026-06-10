import { errorMessage } from '@/constants/error-message'
import type { StageFormat, StageType } from '@/repositories/stage-repository'

export interface StageSetupInput {
  name: string
  type: StageType
  order: number
  format?: StageFormat | null
  teamsToAdvance?: number
  qualifiedTeams?: number
  thirdPlaceMatch?: boolean
  groups?: { name: string; teams: number }[]
}

function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0
}

export function validateSetupPayload(stages: StageSetupInput[]): void {
  const orders = stages.map((s) => s.order)
  const uniqueOrders = new Set(orders)

  if (uniqueOrders.size !== orders.length) {
    throw errorMessage.stageDuplicateOrder
  }

  for (const stage of stages) {
    if (stage.type === 'GROUP_STAGE') {
      if (!stage.format) {
        throw errorMessage.stageInvalidFormat
      }

      if (!stage.groups || stage.groups.length === 0) {
        throw errorMessage.stageGroupRequired
      }
    }

    if (stage.type === 'KNOCKOUT') {
      if (stage.format) {
        throw errorMessage.stageInvalidFormat
      }

      if (!stage.qualifiedTeams || !isPowerOfTwo(stage.qualifiedTeams)) {
        throw errorMessage.stageInvalidQualifiedTeams
      }
    }
  }
}
