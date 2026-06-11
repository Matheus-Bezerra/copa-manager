export type ChampionshipStatus = 'OPEN' | 'IN_PROGRESS' | 'FINISHED';

export type Championship = {
  id: string;
  ownerUserId: string;
  name: string;
  slug: string;
  description: string | null;
  regulations: string | null;
  startDate: string;
  endDate: string;
  status: ChampionshipStatus;
  createdAt: string;
  updatedAt: string;
};
