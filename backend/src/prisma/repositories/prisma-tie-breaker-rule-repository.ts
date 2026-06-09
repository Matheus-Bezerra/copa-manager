import { prisma } from '@/lib/prisma'
import type {
  CreateTieBreakerRuleInput,
  TieBreakerRule,
  TieBreakerRuleRepository,
} from '@/repositories/tie-breaker-rule-repository'

export class PrismaTieBreakerRuleRepository implements TieBreakerRuleRepository {
  async findByChampionshipId(championshipId: string): Promise<TieBreakerRule[]> {
    return prisma.tieBreakerRule.findMany({
      where: { championshipId },
      orderBy: { position: 'asc' },
    })
  }

  async create(data: CreateTieBreakerRuleInput): Promise<TieBreakerRule> {
    return prisma.tieBreakerRule.create({ data })
  }

  async delete(id: string): Promise<void> {
    await prisma.tieBreakerRule.delete({ where: { id } })
  }

  async deleteByChampionshipId(championshipId: string): Promise<void> {
    await prisma.tieBreakerRule.deleteMany({ where: { championshipId } })
  }
}
