import type { Championship } from './championship';

export type CreateChampionshipBody = {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
};

export type CreateChampionshipResponse = {
  championship: Championship;
};
