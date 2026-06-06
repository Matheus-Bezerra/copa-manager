import { errorMessage } from '@/constants/error-message';
import type { ChampionshipRepository } from '@/repositories/championship-repository';
import { toPublicChampionship } from '@/repositories/championship-repository';

export interface GetPublicChampionshipUseCaseRequest {
  slug: string;
}

export class GetPublicChampionshipUseCase {
  constructor(private readonly championshipRepository: ChampionshipRepository) {}

  async execute(request: GetPublicChampionshipUseCaseRequest) {
    const championship = await this.championshipRepository.findBySlug(request.slug);

    if (!championship) {
      throw errorMessage.championshipNotFound;
    }

    return { championship: toPublicChampionship(championship) };
  }
}
