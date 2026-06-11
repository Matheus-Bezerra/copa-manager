import type { ChampionshipStatus } from '../championships/championship';

export type PublicChampionship = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  startDate: string;
  endDate: string;
  status: ChampionshipStatus;
};

export type GetPublicChampionshipResponse = {
  championship: PublicChampionship;
};
