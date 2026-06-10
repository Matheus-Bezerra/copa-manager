export interface PlayerStatistics {
  id: string
  playerId: string
  matchesPlayed: number
  goals: number
  assists: number
  yellowCards: number
  redCards: number
  matchMvps: number
  createdAt: Date
  updatedAt: Date
}

export interface PlayerStatisticsIncrement {
  goals?: number
  assists?: number
  yellowCards?: number
  redCards?: number
  matchMvps?: number
  matchesPlayed?: number
}

export interface PlayerStatisticsRepository {
  findByPlayerId(playerId: string): Promise<PlayerStatistics | null>
  increment(playerId: string, fields: PlayerStatisticsIncrement): Promise<PlayerStatistics>
}
