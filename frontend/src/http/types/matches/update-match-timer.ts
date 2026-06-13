import type { Match } from './match';

export type UpdateMatchTimerAction = 'PAUSE' | 'RESUME';

export type UpdateMatchTimerBody = {
  action: UpdateMatchTimerAction;
};

export type UpdateMatchTimerResponse = {
  match: Match;
};
