import type { ChampionshipMemberRepository } from '@/repositories/championship-member-repository';
import type { ChampionshipAccessService } from '@/services/championship/championship-authorization';

export interface ListMembersUseCaseRequest {
  championshipId: string;
}

export class ListMembersUseCase {
  constructor(
    private readonly championshipService: ChampionshipAccessService,
    private readonly championshipMemberRepository: ChampionshipMemberRepository
  ) {}

  async execute(request: ListMembersUseCaseRequest) {
    await this.championshipService.requireExists(request.championshipId);

    const members = await this.championshipMemberRepository.findByChampionshipId(
      request.championshipId
    );

    return { members };
  }
}
