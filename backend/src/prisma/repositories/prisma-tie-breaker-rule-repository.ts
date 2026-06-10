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

  async replaceByChampionshipId(
    championshipId: string,
    rules: Omit<CreateTieBreakerRuleInput, 'championshipId'>[],
  ): Promise<TieBreakerRule[]> {
    return prisma.$transaction(async (tx) => {
      await tx.tieBreakerRule.deleteMany({ where: { championshipId } })

      const created: TieBreakerRule[] = []

      for (const rule of rules) {
        const entry = await tx.tieBreakerRule.create({
          data: {
            ...rule,
            championshipId,
          },
        })
        created.push(entry)
      }

      return created
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.tieBreakerRule.delete({ where: { id } })
  }

  async deleteByChampionshipId(championshipId: string): Promise<void> {
    await prisma.tieBreakerRule.deleteMany({ where: { championshipId } })
  }
}
