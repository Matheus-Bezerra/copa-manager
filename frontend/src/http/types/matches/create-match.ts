import type { Match } from './match';

export type CreateMatchBody = {
  roundId: string;
  groupId?: string | null;
  homeTeamId?: string | null;
  awayTeamId?: string | null;
  scheduledAt?: string | null;
};

export type CreateMatchResponse = {
  match: Match;
};
