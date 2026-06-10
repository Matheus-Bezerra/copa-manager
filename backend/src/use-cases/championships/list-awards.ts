import { errorMessage } from '@/constants/error-message'
import type { Award, AwardRepository } from '@/repositories/award-repository'
import type { ChampionshipRepository } from '@/repositories/championship-repository'

export class ListAwardsUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly awardRepository: AwardRepository,
  ) {}

  async execute(request: { championshipId: string }): Promise<{ awards: Award[] }> {
    const championship = await this.championshipRepository.findById(request.championshipId)

    if (!championship) {
      throw errorMessage.championshipNotFound
    }

    const awards = await this.awardRepository.findByChampionshipId(request.championshipId)

    return { awards }
  }
}
