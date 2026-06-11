export type MatchEventType = 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'MVP';

export type MatchEvent = {
  id: string;
  matchId: string;
  playerId: string | null;
  teamId: string | null;
  eventType: MatchEventType;
  minute: number | null;
  notes: string | null;
  createdAt: string;
};
