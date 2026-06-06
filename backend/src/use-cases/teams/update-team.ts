import { errorMessage } from '@/constants/error-message';
import { MANAGE_TEAMS_PLAYERS_ROLES } from '@/repositories/championship-repository';
import type { TeamRepository } from '@/repositories/team-repository';
import type { ChampionshipAccessService } from '@/services/championship/championship-authorization';

export interface UpdateTeamUseCaseRequest {
  userId: string;
  championshipId: string;
  teamId: string;
  name?: string;
  shortName?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
}

export class UpdateTeamUseCase {
  constructor(
    private readonly championshipService: ChampionshipAccessService,
    private readonly teamRepository: TeamRepository
  ) {}

  async execute(request: UpdateTeamUseCaseRequest) {
    await this.championshipService.requireAccess(
      request.championshipId,
      request.userId,
      MANAGE_TEAMS_PLAYERS_ROLES
    );

    const team = await this.teamRepository.findById(request.teamId);

    if (!team || team.championshipId !== request.championshipId) {
      throw errorMessage.teamNotFound;
    }

    if (request.name && request.name !== team.name) {
      const existingTeam = await this.teamRepository.findByChampionshipIdAndName(
        request.championshipId,
        request.name
      );

      if (existingTeam) {
        throw errorMessage.teamNameAlreadyTaken;
      }
    }

    const updatedTeam = await this.teamRepository.update(request.teamId, {
      name: request.name,
      shortName: request.shortName,
      logoUrl: request.logoUrl,
      primaryColor: request.primaryColor,
      secondaryColor: request.secondaryColor,
    });

    return { team: updatedTeam };
  }
}
