import type { ChampionshipRole } from '@prisma/client';
import { errorMessage } from '@/constants/error-message';
import type { ChampionshipMember } from '@/repositories/championship-member-repository';
import type { ChampionshipMemberRepository } from '@/repositories/championship-member-repository';
import type { Championship, ChampionshipRepository } from '@/repositories/championship-repository';

export class ChampionshipAccessService {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly championshipMemberRepository: ChampionshipMemberRepository
  ) {}

  async requireExists(championshipId: string): Promise<Championship> {
    const championship = await this.championshipRepository.findById(championshipId);

    if (!championship) {
      throw errorMessage.championshipNotFound;
    }

    return championship;
  }

  async requireAccess(
    championshipId: string,
    userId: string,
    allowedRoles: ChampionshipRole[]
  ): Promise<{ championship: Championship; member: ChampionshipMember }> {
    const championship = await this.requireExists(championshipId);

    const member = await this.championshipMemberRepository.findByChampionshipAndUser(
      championshipId,
      userId
    );

    if (!member || !allowedRoles.includes(member.role)) {
      throw errorMessage.championshipForbidden;
    }

    return { championship, member };
  }
}
