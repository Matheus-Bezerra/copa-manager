export type MatchStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';

export type Match = {
  id: string;
  championshipId: string;
  roundId: string;
  groupId: string | null;
  homeTeamId: string | null;
  awayTeamId: string | null;
  scheduledAt: string | null;
  startedAt: string | null;
  pausedAt: string | null;
  accumulatedPausedMs: number;
  status: MatchStatus;
  createdAt: string;
  updatedAt: string;
};

export type MatchListItem = Match & {
  homeScore: number | null;
  awayScore: number | null;
};
