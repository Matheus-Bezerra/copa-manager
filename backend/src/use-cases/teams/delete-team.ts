import { errorMessage } from '@/constants/error-message';
import { MANAGE_TEAMS_PLAYERS_ROLES } from '@/repositories/championship-repository';
import type { TeamRepository } from '@/repositories/team-repository';
import type { ChampionshipAccessService } from '@/services/championship/championship-authorization';

export interface DeleteTeamUseCaseRequest {
  userId: string;
  championshipId: string;
  teamId: string;
}

export class DeleteTeamUseCase {
  constructor(
    private readonly championshipService: ChampionshipAccessService,
    private readonly teamRepository: TeamRepository
  ) {}

  async execute(request: DeleteTeamUseCaseRequest) {
    await this.championshipService.requireAccess(
      request.championshipId,
      request.userId,
      MANAGE_TEAMS_PLAYERS_ROLES
    );

    const team = await this.teamRepository.findById(request.teamId);

    if (!team || team.championshipId !== request.championshipId) {
      throw errorMessage.teamNotFound;
    }

    await this.teamRepository.delete(request.teamId);
  }
}
