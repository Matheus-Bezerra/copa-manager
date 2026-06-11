import type { Team } from './team';

export type UpdateTeamBody = {
  name?: string;
  shortName?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
};

export type UpdateTeamResponse = {
  team: Team;
};
