import type { MatchEvent } from './match-event';

export type RegisterRedCardBody = {
  playerId: string;
  minute?: number | null;
};

export type RegisterRedCardResponse = {
  event: MatchEvent;
};
