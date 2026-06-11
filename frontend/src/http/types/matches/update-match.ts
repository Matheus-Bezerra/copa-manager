import type { Match } from './match';

export type UpdateMatchBody = {
  homeTeamId?: string | null;
  awayTeamId?: string | null;
  scheduledAt?: string | null;
};

export type UpdateMatchResponse = {
  match: Match;
};
