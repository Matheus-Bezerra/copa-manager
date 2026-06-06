import type { ChampionshipRepository } from '@/repositories/championship-repository';
import type { ChampionshipAccessService } from '@/services/championship/championship-authorization';

export interface DeleteChampionshipUseCaseRequest {
  userId: string;
  championshipId: string;
}

export class DeleteChampionshipUseCase {
  constructor(
    private readonly championshipService: ChampionshipAccessService,
    private readonly championshipRepository: ChampionshipRepository
  ) {}

  async execute(request: DeleteChampionshipUseCaseRequest) {
    await this.championshipService.requireAccess(request.championshipId, request.userId, ['OWNER']);

    await this.championshipRepository.delete(request.championshipId);
  }
}
