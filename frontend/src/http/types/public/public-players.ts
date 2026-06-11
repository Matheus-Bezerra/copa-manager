import type { PlayerStatistics } from '../players/player';

export type PublicPlayer = {
  id: string;
  teamId: string;
  name: string;
  shirtNumber: number | null;
  statistics: PlayerStatistics | null;
};

export type FetchPublicPlayersResponse = {
  players: PublicPlayer[];
};
