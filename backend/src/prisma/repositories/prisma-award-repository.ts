import { prisma } from '@/lib/prisma'
import type {
  Award,
  AwardRepository,
  CreateAwardInput,
} from '@/repositories/award-repository'

export class PrismaAwardRepository implements AwardRepository {
  async findById(id: string): Promise<Award | null> {
    return prisma.award.findUnique({ where: { id } })
  }

  async findByChampionshipId(championshipId: string): Promise<Award[]> {
    return prisma.award.findMany({
      where: { championshipId },
      orderBy: { createdAt: 'asc' },
    })
  }

  async create(data: CreateAwardInput): Promise<Award> {
    return prisma.award.create({ data })
  }

  async delete(id: string): Promise<void> {
    await prisma.award.delete({ where: { id } })
  }
}
