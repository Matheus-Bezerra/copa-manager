import { prisma } from '@/lib/prisma'
import type {
  CreateStageInput,
  Stage,
  StageRepository,
  UpdateStageInput,
} from '@/repositories/stage-repository'

export class PrismaStageRepository implements StageRepository {
  async findById(id: string): Promise<Stage | null> {
    return prisma.stage.findUnique({ where: { id } })
  }

  async findByChampionshipId(championshipId: string): Promise<Stage[]> {
    return prisma.stage.findMany({
      where: { championshipId },
      orderBy: { displayOrder: 'asc' },
    })
  }

  async findMaxDisplayOrder(championshipId: string): Promise<number> {
    const result = await prisma.stage.aggregate({
      where: { championshipId },
      _max: { displayOrder: true },
    })
    return result._max.displayOrder ?? 0
  }

  async create(data: CreateStageInput): Promise<Stage> {
    return prisma.stage.create({ data })
  }

  async update(id: string, data: UpdateStageInput): Promise<Stage> {
    return prisma.stage.update({ where: { id }, data })
  }

  async delete(id: string): Promise<void> {
    await prisma.stage.delete({ where: { id } })
  }

  async deleteByChampionshipId(championshipId: string): Promise<void> {
    await prisma.stage.deleteMany({ where: { championshipId } })
  }
}
