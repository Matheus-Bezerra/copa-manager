import type { TeamRepository } from '@/repositories/team-repository';
import type { ChampionshipAccessService } from '@/services/championship/championship-authorization';

export interface ListTeamsUseCaseRequest {
  championshipId: string;
}

export class ListTeamsUseCase {
  constructor(
    private readonly championshipService: ChampionshipAccessService,
    private readonly teamRepository: TeamRepository
  ) {}

  async execute(request: ListTeamsUseCaseRequest) {
    await this.championshipService.requireExists(request.championshipId);

    const teams = await this.teamRepository.findByChampionshipId(request.championshipId);

    return { teams };
  }
}
