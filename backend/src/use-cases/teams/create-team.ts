import { ulid } from 'ulidx';
import { errorMessage } from '@/constants/error-message';
import { MANAGE_TEAMS_PLAYERS_ROLES } from '@/repositories/championship-repository';
import type { TeamRepository } from '@/repositories/team-repository';
import type { ChampionshipAccessService } from '@/services/championship/championship-authorization';

export interface CreateTeamUseCaseRequest {
  userId: string;
  championshipId: string;
  name: string;
  shortName?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
}

export class CreateTeamUseCase {
  constructor(
    private readonly championshipService: ChampionshipAccessService,
    private readonly teamRepository: TeamRepository
  ) {}

  async execute(request: CreateTeamUseCaseRequest) {
    await this.championshipService.requireAccess(
      request.championshipId,
      request.userId,
      MANAGE_TEAMS_PLAYERS_ROLES
    );

    const existingTeam = await this.teamRepository.findByChampionshipIdAndName(
      request.championshipId,
      request.name
    );

    if (existingTeam) {
      throw errorMessage.teamNameAlreadyTaken;
    }

    const team = await this.teamRepository.create({
      id: ulid(),
      championshipId: request.championshipId,
      name: request.name,
      shortName: request.shortName ?? null,
      logoUrl: request.logoUrl ?? null,
      primaryColor: request.primaryColor ?? null,
      secondaryColor: request.secondaryColor ?? null,
    });

    return { team };
  }
}
