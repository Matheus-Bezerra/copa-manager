import type { MatchListItem, MatchStatus } from '../matches/match';

export type FetchPublicMatchesParams = {
  slug: string;
  roundId?: string;
  groupId?: string;
  status?: MatchStatus;
};

export type FetchPublicMatchesResponse = {
  matches: MatchListItem[];
};
