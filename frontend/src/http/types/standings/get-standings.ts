import type { StandingEntry } from './standings';

export type GetStandingsParams = {
  championshipId: string;
  stageId: string;
  groupId: string;
};

export type GetStandingsResponse = {
  standings: StandingEntry[];
};
