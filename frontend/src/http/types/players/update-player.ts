import type { Player } from './player';

export type UpdatePlayerBody = {
  teamId?: string;
  name?: string;
  shirtNumber?: number | null;
};

export type UpdatePlayerResponse = {
  player: Player;
};
