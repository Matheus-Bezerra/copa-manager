import type { Match } from './match';

export type MatchResult = {
  id: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  homePenaltyScore: number | null;
  awayPenaltyScore: number | null;
  createdAt: string;
};

export type RegisterMatchResultBody = {
  homeScore: number;
  awayScore: number;
  homePenaltyScore?: number | null;
  awayPenaltyScore?: number | null;
};

export type RegisterMatchResultResponse = {
  match: Match;
  result: MatchResult;
};
