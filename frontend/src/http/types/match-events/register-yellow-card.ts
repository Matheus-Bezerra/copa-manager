import type { MatchEvent } from './match-event';

export type RegisterYellowCardBody = {
  playerId: string;
  minute?: number | null;
};

export type RegisterYellowCardResponse = {
  event: MatchEvent;
};
