import { errorMessage } from '@/constants/error-message';
import { MANAGE_TEAMS_PLAYERS_ROLES } from '@/repositories/championship-repository';
import type { PlayerRepository } from '@/repositories/player-repository';
import type { TeamRepository } from '@/repositories/team-repository';
import type { ChampionshipAccessService } from '@/services/championship/championship-authorization';

export interface DeletePlayerUseCaseRequest {
  userId: string;
  championshipId: string;
  playerId: string;
}

export class DeletePlayerUseCase {
  constructor(
    private readonly championshipService: ChampionshipAccessService,
    private readonly teamRepository: TeamRepository,
    private readonly playerRepository: PlayerRepository
  ) {}

  async execute(request: DeletePlayerUseCaseRequest) {
    await this.championshipService.requireAccess(
      request.championshipId,
      request.userId,
      MANAGE_TEAMS_PLAYERS_ROLES
    );

    const player = await this.playerRepository.findById(request.playerId);

    if (!player) {
      throw errorMessage.playerNotFound;
    }

    const team = await this.teamRepository.findById(player.teamId);

    if (!team || team.championshipId !== request.championshipId) {
      throw errorMessage.playerNotFound;
    }

    await this.playerRepository.delete(request.playerId);
  }
}
