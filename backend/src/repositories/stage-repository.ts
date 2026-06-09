export type StageType = 'GROUP_STAGE' | 'KNOCKOUT'
export type StageFormat = 'ROUND_ROBIN' | 'DOUBLE_ROUND_ROBIN'

export interface Stage {
  id: string
  championshipId: string
  name: string
  type: StageType
  format: StageFormat | null
  teamsToAdvance: number
  qualifiedTeams: number | null
  thirdPlaceMatch: boolean
  displayOrder: number
  createdAt: Date
}

export interface CreateStageInput {
  id: string
  championshipId: string
  name: string
  type: StageType
  format?: StageFormat | null
  teamsToAdvance?: number
  qualifiedTeams?: number | null
  thirdPlaceMatch?: boolean
  displayOrder: number
}

export interface UpdateStageInput {
  name?: string
  format?: StageFormat | null
  teamsToAdvance?: number
  qualifiedTeams?: number | null
  thirdPlaceMatch?: boolean
  displayOrder?: number
}

export interface StageRepository {
  findById(id: string): Promise<Stage | null>
  findByChampionshipId(championshipId: string): Promise<Stage[]>
  findMaxDisplayOrder(championshipId: string): Promise<number>
  create(data: CreateStageInput): Promise<Stage>
  update(id: string, data: UpdateStageInput): Promise<Stage>
  delete(id: string): Promise<void>
  deleteByChampionshipId(championshipId: string): Promise<void>
}
