import type { Player } from './player';

export type CreatePlayerBody = {
  teamId: string;
  name: string;
  shirtNumber?: number | null;
};

export type CreatePlayerResponse = {
  player: Player;
};
