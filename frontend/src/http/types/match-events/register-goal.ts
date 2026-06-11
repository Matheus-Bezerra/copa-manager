import type { MatchEvent } from './match-event';

export type RegisterGoalBody = {
  playerId?: string;
  teamId?: string;
  minute?: number | null;
};

export type RegisterGoalResponse = {
  event: MatchEvent;
};
