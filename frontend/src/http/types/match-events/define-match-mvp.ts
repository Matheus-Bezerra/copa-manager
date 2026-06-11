import type { MatchEvent } from './match-event';

export type DefineMatchMvpBody = {
  playerId: string;
};

export type DefineMatchMvpResponse = {
  event: MatchEvent;
};
