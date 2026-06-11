import type { Match } from './match';

export type UpdateMatchStatusBody = {
  status: 'IN_PROGRESS' | 'CANCELLED';
};

export type UpdateMatchStatusResponse = {
  match: Match;
};
