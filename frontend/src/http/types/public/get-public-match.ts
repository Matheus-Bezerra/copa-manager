import type { Match } from '../matches/match';
import type { MatchResult } from '../matches/register-match-result';

export type GetPublicMatchParams = {
  slug: string;
  matchId: string;
};

export type GetPublicMatchResponse = {
  match: Match;
  result: MatchResult | null;
  matchDuration: number;
};
