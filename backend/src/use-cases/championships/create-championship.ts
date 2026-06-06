import { ulid } from 'ulidx';
import { errorMessage } from '@/constants/error-message';
import type { ChampionshipMemberRepository } from '@/repositories/championship-member-repository';
import type { ChampionshipRepository } from '@/repositories/championship-repository';
import { slugFromName } from '@/utils/generators/generate-slug';

export interface CreateChampionshipUseCaseRequest {
  userId: string;
  name: string;
  description?: string | null;
  startDate: Date;
  endDate: Date;
}

export class CreateChampionshipUseCase {
  constructor(
    private readonly championshipRepository: ChampionshipRepository,
    private readonly championshipMemberRepository: ChampionshipMemberRepository
  ) {}

  async execute(request: CreateChampionshipUseCaseRequest) {
    const slug = slugFromName(request.name);

    if (await this.championshipRepository.slugExists(slug)) {
      throw errorMessage.championshipNameAlreadyExists;
    }

    const championshipId = ulid();

    const championship = await this.championshipRepository.create({
      id: championshipId,
      ownerUserId: request.userId,
      name: request.name,
      slug,
      description: request.description ?? null,
      startDate: request.startDate,
      endDate: request.endDate,
    });

    await this.championshipMemberRepository.create({
      id: ulid(),
      championshipId: championship.id,
      userId: request.userId,
      role: 'OWNER',
    });

    return { championship };
  }
}
