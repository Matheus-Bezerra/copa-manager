import type { StandingEntry } from '../standings/standings';

export type GetPublicStandingsParams = {
  slug: string;
  stageId: string;
  groupId: string;
};

export type GetPublicStandingsResponse = {
  standings: StandingEntry[];
};
