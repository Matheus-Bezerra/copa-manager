import type { Award, AwardType } from './award';

export type GrantAwardBody = {
  playerId: string;
  type: AwardType;
};

export type GrantAwardResponse = {
  award: Award;
};
