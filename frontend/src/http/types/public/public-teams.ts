export type PublicTeam = {
  id: string;
  name: string;
  shortName: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
};

export type FetchPublicTeamsResponse = {
  teams: PublicTeam[];
};
