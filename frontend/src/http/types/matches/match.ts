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
  status: MatchStatus;
  createdAt: string;
  updatedAt: string;
};

export type MatchListItem = Match & {
  homeScore: number | null;
  awayScore: number | null;
};
