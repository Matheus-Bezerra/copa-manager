import { prisma } from '@/lib/prisma'
import type {
  CreateRoundInput,
  Round,
  RoundRepository,
  UpdateRoundInput,
} from '@/repositories/round-repository'

export class PrismaRoundRepository implements RoundRepository {
  async findById(id: string): Promise<Round | null> {
    return prisma.round.findUnique({ where: { id } })
  }

  async findByStageId(stageId: string): Promise<Round[]> {
    return prisma.round.findMany({
      where: { stageId },
      orderBy: { number: 'asc' },
    })
  }

  async findByStageIdAndNumber(stageId: string, number: number): Promise<Round | null> {
    return prisma.round.findUnique({
      where: { stageId_number: { stageId, number } },
    })
  }

  async findMaxNumber(stageId: string): Promise<number> {
    const result = await prisma.round.aggregate({
      where: { stageId },
      _max: { number: true },
    })
    return result._max.number ?? 0
  }

  async create(data: CreateRoundInput): Promise<Round> {
    return prisma.round.create({ data })
  }

  async update(id: string, data: UpdateRoundInput): Promise<Round> {
    return prisma.round.update({ where: { id }, data })
  }

  async delete(id: string): Promise<void> {
    await prisma.round.delete({ where: { id } })
  }
}
