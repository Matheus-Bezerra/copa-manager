import type { ChampionshipStatus } from '@prisma/client';
import { errorMessage } from '@/constants/error-message';
import {
  MANAGE_CHAMPIONSHIP_ROLES,
  type ChampionshipRepository,
} from '@/repositories/championship-repository';
import type { ChampionshipAccessService } from '@/services/championship/championship-authorization';
import { slugFromName } from '@/utils/generators/generate-slug';

export interface UpdateChampionshipUseCaseRequest {
  userId: string;
  championshipId: string;
  name?: string;
  description?: string | null;
  regulations?: string | null;
  startDate?: Date;
  endDate?: Date;
  status?: ChampionshipStatus;
}

export class UpdateChampionshipUseCase {
  constructor(
    private readonly championshipService: ChampionshipAccessService,
    private readonly championshipRepository: ChampionshipRepository
  ) {}

  async execute(request: UpdateChampionshipUseCaseRequest) {
    await this.championshipService.requireAccess(
      request.championshipId,
      request.userId,
      MANAGE_CHAMPIONSHIP_ROLES
    );

    let slug: string | undefined;

    if (request.name !== undefined) {
      slug = slugFromName(request.name);

      const championshipWithSlug = await this.championshipRepository.findBySlug(slug);

      if (championshipWithSlug && championshipWithSlug.id !== request.championshipId) {
        throw errorMessage.championshipNameAlreadyExists;
      }
    }

    const championship = await this.championshipRepository.update(request.championshipId, {
      name: request.name,
      slug,
      description: request.description,
      regulations: request.regulations,
      startDate: request.startDate,
      endDate: request.endDate,
      status: request.status,
    });

    return { championship };
  }
}
