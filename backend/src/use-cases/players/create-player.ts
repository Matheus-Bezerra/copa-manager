import { ulid } from 'ulidx';
import { errorMessage } from '@/constants/error-message';
import { MANAGE_TEAMS_PLAYERS_ROLES } from '@/repositories/championship-repository';
import type { PlayerStatisticsInput, PlayerRepository } from '@/repositories/player-repository';
import type { TeamRepository } from '@/repositories/team-repository';
import type { ChampionshipAccessService } from '@/services/championship/championship-authorization';

export interface CreatePlayerUseCaseRequest {
  userId: string;
  championshipId: string;
  teamId: string;
  name: string;
  shirtNumber?: number | null;
  statistics?: PlayerStatisticsInput;
}

export class CreatePlayerUseCase {
  constructor(
    private readonly championshipService: ChampionshipAccessService,
    private readonly teamRepository: TeamRepository,
    private readonly playerRepository: PlayerRepository
  ) {}

  async execute(request: CreatePlayerUseCaseRequest) {
    await this.championshipService.requireAccess(
      request.championshipId,
      request.userId,
      MANAGE_TEAMS_PLAYERS_ROLES
    );

    const team = await this.teamRepository.findById(request.teamId);

    if (!team || team.championshipId !== request.championshipId) {
      throw errorMessage.teamNotFound;
    }

    const player = await this.playerRepository.create({
      id: ulid(),
      teamId: request.teamId,
      name: request.name,
      shirtNumber: request.shirtNumber ?? null,
      statistics: request.statistics,
    });

    return { player };
  }
}
