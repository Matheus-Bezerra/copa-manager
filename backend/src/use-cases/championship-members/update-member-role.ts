import type { ChampionshipRole } from '@prisma/client';
import { errorMessage } from '@/constants/error-message';
import type { ChampionshipMemberRepository } from '@/repositories/championship-member-repository';
import { MANAGE_CHAMPIONSHIP_ROLES } from '@/repositories/championship-repository';
import type { ChampionshipAccessService } from '@/services/championship/championship-authorization';

export interface UpdateMemberRoleUseCaseRequest {
  userId: string;
  championshipId: string;
  memberId: string;
  role: ChampionshipRole;
}

export class UpdateMemberRoleUseCase {
  constructor(
    private readonly championshipService: ChampionshipAccessService,
    private readonly championshipMemberRepository: ChampionshipMemberRepository
  ) {}

  async execute(request: UpdateMemberRoleUseCaseRequest) {
    await this.championshipService.requireAccess(
      request.championshipId,
      request.userId,
      MANAGE_CHAMPIONSHIP_ROLES
    );

    const member = await this.championshipMemberRepository.findById(request.memberId);

    if (!member || member.championshipId !== request.championshipId) {
      throw errorMessage.championshipMemberNotFound;
    }

    if (member.role === 'OWNER' || request.role === 'OWNER') {
      throw errorMessage.championshipCannotModifyOwner;
    }

    const updatedMember = await this.championshipMemberRepository.updateRole(
      request.memberId,
      request.role
    );

    return { member: updatedMember };
  }
}
