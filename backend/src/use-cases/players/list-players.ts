import type { PlayerRepository } from '@/repositories/player-repository';
import type { ChampionshipAccessService } from '@/services/championship/championship-authorization';

export interface ListPlayersUseCaseRequest {
  championshipId: string;
}

export class ListPlayersUseCase {
  constructor(
    private readonly championshipService: ChampionshipAccessService,
    private readonly playerRepository: PlayerRepository
  ) {}

  async execute(request: ListPlayersUseCaseRequest) {
    await this.championshipService.requireExists(request.championshipId);

    const players = await this.playerRepository.findByChampionshipId(request.championshipId);

    return { players };
  }
}
