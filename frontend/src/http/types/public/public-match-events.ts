import type { MatchEvent } from '../match-events/match-event';

export type FetchPublicMatchEventsParams = {
  slug: string;
  matchId: string;
};

export type FetchPublicMatchEventsResponse = {
  events: MatchEvent[];
};
