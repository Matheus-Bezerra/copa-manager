import { PrismaChampionshipMemberRepository } from '@/prisma/repositories/prisma-championship-member-repository';
import { PrismaChampionshipRepository } from '@/prisma/repositories/prisma-championship-repository';
import { ChampionshipAccessService } from '@/services/championship/championship-authorization';

export function prismaChampionshipService(): ChampionshipAccessService {
  return new ChampionshipAccessService(
    new PrismaChampionshipRepository(),
    new PrismaChampionshipMemberRepository()
  );
}
