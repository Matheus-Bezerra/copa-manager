export interface Round {
  id: string
  stageId: string
  number: number
  name: string | null
  createdAt: Date
}

export interface CreateRoundInput {
  id: string
  stageId: string
  number: number
  name?: string | null
}

export interface UpdateRoundInput {
  name?: string | null
}

export interface RoundRepository {
  findById(id: string): Promise<Round | null>
  findByStageId(stageId: string): Promise<Round[]>
  findByStageIdAndNumber(stageId: string, number: number): Promise<Round | null>
  findMaxNumber(stageId: string): Promise<number>
  create(data: CreateRoundInput): Promise<Round>
  update(id: string, data: UpdateRoundInput): Promise<Round>
  delete(id: string): Promise<void>
}
