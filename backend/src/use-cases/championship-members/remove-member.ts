import { errorMessage } from '@/constants/error-message';
import type { ChampionshipMemberRepository } from '@/repositories/championship-member-repository';
import { MANAGE_CHAMPIONSHIP_ROLES } from '@/repositories/championship-repository';
import type { ChampionshipAccessService } from '@/services/championship/championship-authorization';

export interface RemoveMemberUseCaseRequest {
  userId: string;
  championshipId: string;
  memberId: string;
}

export class RemoveMemberUseCase {
  constructor(
    private readonly championshipService: ChampionshipAccessService,
    private readonly championshipMemberRepository: ChampionshipMemberRepository
  ) {}

  async execute(request: RemoveMemberUseCaseRequest) {
    await this.championshipService.requireAccess(
      request.championshipId,
      request.userId,
      MANAGE_CHAMPIONSHIP_ROLES
    );

    const member = await this.championshipMemberRepository.findById(request.memberId);

    if (!member || member.championshipId !== request.championshipId) {
      throw errorMessage.championshipMemberNotFound;
    }

    if (member.role === 'OWNER') {
      throw errorMessage.championshipCannotModifyOwner;
    }

    await this.championshipMemberRepository.delete(request.memberId);
  }
}
