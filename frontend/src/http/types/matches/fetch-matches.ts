import type { MatchListItem, MatchStatus } from './match';

export type FetchMatchesParams = {
  championshipId: string;
  roundId?: string;
  groupId?: string;
  status?: MatchStatus;
};

// GET /championships/:id/matches — { data: MatchListItem[] }
export type FetchMatchesResponse = MatchListItem[];
