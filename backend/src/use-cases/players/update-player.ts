import { errorMessage } from '@/constants/error-message';
import { MANAGE_TEAMS_PLAYERS_ROLES } from '@/repositories/championship-repository';
import type { PlayerStatisticsInput, PlayerRepository } from '@/repositories/player-repository';
import type { TeamRepository } from '@/repositories/team-repository';
import type { ChampionshipAccessService } from '@/services/championship/championship-authorization';

export interface UpdatePlayerUseCaseRequest {
  userId: string;
  championshipId: string;
  playerId: string;
  teamId?: string;
  name?: string;
  shirtNumber?: number | null;
  statistics?: PlayerStatisticsInput;
}

export class UpdatePlayerUseCase {
  constructor(
    private readonly championshipService: ChampionshipAccessService,
    private readonly teamRepository: TeamRepository,
    private readonly playerRepository: PlayerRepository
  ) {}

  async execute(request: UpdatePlayerUseCaseRequest) {
    await this.championshipService.requireAccess(
      request.championshipId,
      request.userId,
      MANAGE_TEAMS_PLAYERS_ROLES
    );

    const player = await this.playerRepository.findById(request.playerId);

    if (!player) {
      throw errorMessage.playerNotFound;
    }

    const currentTeam = await this.teamRepository.findById(player.teamId);

    if (!currentTeam || currentTeam.championshipId !== request.championshipId) {
      throw errorMessage.playerNotFound;
    }

    if (request.teamId && request.teamId !== player.teamId) {
      const newTeam = await this.teamRepository.findById(request.teamId);

      if (!newTeam || newTeam.championshipId !== request.championshipId) {
        throw errorMessage.teamNotFound;
      }
    }

    const updatedPlayer = await this.playerRepository.update(request.playerId, {
      teamId: request.teamId,
      name: request.name,
      shirtNumber: request.shirtNumber,
      statistics: request.statistics,
    });

    return { player: updatedPlayer };
  }
}
