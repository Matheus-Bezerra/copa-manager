import type { ChampionshipAccessService } from '@/services/championship/championship-authorization';

export interface GetChampionshipUseCaseRequest {
  championshipId: string;
}

export class GetChampionshipUseCase {
  constructor(private readonly championshipService: ChampionshipAccessService) {}

  async execute(request: GetChampionshipUseCaseRequest) {
    const championship = await this.championshipService.requireExists(request.championshipId);

    return { championship };
  }
}
