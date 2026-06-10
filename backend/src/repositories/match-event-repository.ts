export type MatchEventType = 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'MVP'

export interface MatchEvent {
  id: string
  matchId: string
  playerId: string | null
  teamId: string | null
  eventType: MatchEventType
  minute: number | null
  notes: string | null
  createdAt: Date
}

export interface CreateMatchEventInput {
  id: string
  matchId: string
  playerId: string
  teamId: string
  eventType: MatchEventType
  minute?: number | null
  notes?: string | null
}

export interface MatchEventRepository {
  create(data: CreateMatchEventInput): Promise<MatchEvent>
  findByMatchId(matchId: string): Promise<MatchEvent[]>
  findByMatchIdAndType(matchId: string, eventType: MatchEventType): Promise<MatchEvent[]>
  delete(id: string): Promise<void>
}
