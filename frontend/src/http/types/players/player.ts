export type PlayerStatistics = {
  matchesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  matchMvps: number;
};

export type Player = {
  id: string;
  teamId: string;
  name: string;
  shirtNumber: number | null;
  createdAt: string;
  updatedAt: string;
  statistics: PlayerStatistics | null;
};
