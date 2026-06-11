import type { Team } from './team';

export type CreateTeamBody = {
  name: string;
  shortName?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
};

export type CreateTeamResponse = {
  team: Team;
};
