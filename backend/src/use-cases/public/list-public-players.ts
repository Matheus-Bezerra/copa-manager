import { errorMessage } from '@/constants/error-message';
import type { ChampionshipRepository } from '@/repositories/championship-repository';
import { toPublicPlayer } from '@/repositories/player-repository';
import type { PlayerRepository } from '@/repositories/player-repository';

export interface ListPublicPlayersUseCaseRequest {
  slug: string;
}

export class ListPublicPlayersUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly playerRepository: PlayerRepository
  ) {}

  async execute(request: ListPublicPlayersUseCaseRequest) {
    const championship = await this.championshipRepository.findBySlug(request.slug);

    if (!championship) {
      throw errorMessage.championshipNotFound;
    }

    const players = await this.playerRepository.findByChampionshipId(championship.id);

    return {
      players: players.map(toPublicPlayer),
    };
  }
}
