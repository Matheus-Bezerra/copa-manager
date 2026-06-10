export interface MatchResult {
  id: string
  matchId: string
  homeScore: number
  awayScore: number
  homePenaltyScore: number | null
  awayPenaltyScore: number | null
  createdAt: Date
}

export interface UpsertMatchResultInput {
  id: string
  matchId: string
  homeScore: number
  awayScore: number
  homePenaltyScore?: number | null
  awayPenaltyScore?: number | null
}

export interface MatchResultRepository {
  findByMatchId(matchId: string): Promise<MatchResult | null>
  upsert(data: UpsertMatchResultInput): Promise<MatchResult>
  deleteByMatchId(matchId: string): Promise<void>
}
