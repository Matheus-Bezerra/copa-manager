export interface PlayerStatistics {
  id: string;
  playerId: string;
  matchesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  matchMvps: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Player {
  id: string;
  teamId: string;
  name: string;
  shirtNumber: number | null;
  createdAt: Date;
  updatedAt: Date;
  statistics: PlayerStatistics | null;
}

export interface PlayerStatisticsInput {
  matchesPlayed?: number;
  goals?: number;
  assists?: number;
  yellowCards?: number;
  redCards?: number;
  matchMvps?: number;
}

export interface CreatePlayerInput {
  id: string;
  teamId: string;
  name: string;
  shirtNumber?: number | null;
  statistics?: PlayerStatisticsInput;
}

export interface UpdatePlayerInput {
  teamId?: string;
  name?: string;
  shirtNumber?: number | null;
  statistics?: PlayerStatisticsInput;
}

export interface PlayerRepository {
  findById(id: string): Promise<Player | null>;
  findByChampionshipId(championshipId: string): Promise<Player[]>;
  findByTeamIds(teamIds: string[]): Promise<Player[]>;
  create(data: CreatePlayerInput): Promise<Player>;
  update(id: string, data: UpdatePlayerInput): Promise<Player>;
  delete(id: string): Promise<void>;
}

export interface PublicPlayer {
  id: string;
  teamId: string;
  name: string;
  shirtNumber: number | null;
  statistics: {
    matchesPlayed: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    matchMvps: number;
  } | null;
}

export function toPublicPlayer(player: Player): PublicPlayer {
  return {
    id: player.id,
    teamId: player.teamId,
    name: player.name,
    shirtNumber: player.shirtNumber,
    statistics: player.statistics
      ? {
        matchesPlayed: player.statistics.matchesPlayed,
        goals: player.statistics.goals,
        assists: player.statistics.assists,
        yellowCards: player.statistics.yellowCards,
        redCards: player.statistics.redCards,
        matchMvps: player.statistics.matchMvps,
      }
      : null,
  };
}
