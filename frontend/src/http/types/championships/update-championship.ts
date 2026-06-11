import type { Championship, ChampionshipStatus } from './championship';

export type UpdateChampionshipBody = {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: ChampionshipStatus;
};

export type UpdateChampionshipResponse = {
  championship: Championship;
};
