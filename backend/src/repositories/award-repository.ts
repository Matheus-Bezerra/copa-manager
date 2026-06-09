export type AwardType = 'TOP_SCORER' | 'MATCH_MVP' | 'TOURNAMENT_MVP' | 'FAIR_PLAY'

export interface Award {
  id: string
  championshipId: string
  playerId: string
  awardType: AwardType
  createdAt: Date
}

export interface CreateAwardInput {
  id: string
  championshipId: string
  playerId: string
  awardType: AwardType
}

export interface AwardRepository {
  findById(id: string): Promise<Award | null>
  findByChampionshipId(championshipId: string): Promise<Award[]>
  create(data: CreateAwardInput): Promise<Award>
  delete(id: string): Promise<void>
}
