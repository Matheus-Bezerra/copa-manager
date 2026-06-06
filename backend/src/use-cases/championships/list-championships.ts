import type { ChampionshipRepository } from '@/repositories/championship-repository';

export interface ListChampionshipsUseCaseRequest {
  userId: string;
}

export class ListChampionshipsUseCase {
  constructor(private readonly championshipRepository: ChampionshipRepository) {}

  async execute(request: ListChampionshipsUseCaseRequest) {
    const championships = await this.championshipRepository.findByUserId(request.userId);

    return { championships };
  }
}
