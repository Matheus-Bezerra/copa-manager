export interface ChampionshipRules {
  id: string
  championshipId: string
  winPoints: number
  drawPoints: number
  penaltyBonusPoints: number
  yellowCardsForSuspension: number
  redCardSuspensionGames: number
  matchDuration: number
  createdAt: Date
  updatedAt: Date
}

export interface UpsertChampionshipRulesInput {
  id: string
  championshipId: string
  winPoints?: number
  drawPoints?: number
  penaltyBonusPoints?: number
  yellowCardsForSuspension?: number
  redCardSuspensionGames?: number
  matchDuration?: number
}

export interface UpdateChampionshipRulesInput {
  winPoints?: number
  drawPoints?: number
  penaltyBonusPoints?: number
  yellowCardsForSuspension?: number
  redCardSuspensionGames?: number
  matchDuration?: number
}

export interface ChampionshipRulesRepository {
  findByChampionshipId(championshipId: string): Promise<ChampionshipRules | null>
  upsert(data: UpsertChampionshipRulesInput): Promise<ChampionshipRules>
}
