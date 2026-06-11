import type { Match } from './match';
import type { MatchResult } from './register-match-result';

export type GetMatchResponse = {
  match: Match;
  result: MatchResult | null;
};
