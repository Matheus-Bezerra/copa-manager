export type MatchStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED'

export interface Match {
  id: string
  championshipId: string
  roundId: string
  groupId: string | null
  homeTeamId: string | null
  awayTeamId: string | null
  scheduledAt: Date | null
  status: MatchStatus
  createdAt: Date
  updatedAt: Date
}

export interface CreateMatchInput {
  id: string
  championshipId: string
  roundId: string
  groupId?: string | null
  homeTeamId?: string | null
  awayTeamId?: string | null
  scheduledAt?: Date | null
  status?: MatchStatus
}

export interface UpdateMatchInput {
  homeTeamId?: string | null
  awayTeamId?: string | null
  scheduledAt?: Date | null
  status?: MatchStatus
}

export interface ListMatchesFilters {
  roundId?: string
  groupId?: string
  status?: MatchStatus
}

export interface MatchRepository {
  findById(id: string): Promise<Match | null>
  findByChampionshipId(championshipId: string, filters?: ListMatchesFilters): Promise<Match[]>
  findByRoundId(roundId: string): Promise<Match[]>
  create(data: CreateMatchInput): Promise<Match>
  update(id: string, data: UpdateMatchInput): Promise<Match>
  delete(id: string): Promise<void>
}
