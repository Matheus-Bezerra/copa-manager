import { prisma } from '@/lib/prisma'
import type {
  CreateMatchBracketLinkInput,
  MatchBracketLink,
  MatchBracketLinkRepository,
} from '@/repositories/match-bracket-link-repository'

export class PrismaMatchBracketLinkRepository implements MatchBracketLinkRepository {
  async findById(id: string): Promise<MatchBracketLink | null> {
    return prisma.matchBracketLink.findUnique({ where: { id } })
  }

  async findByFromMatchId(fromMatchId: string): Promise<MatchBracketLink[]> {
    return prisma.matchBracketLink.findMany({ where: { fromMatchId } })
  }

  async findByToMatchId(toMatchId: string): Promise<MatchBracketLink[]> {
    return prisma.matchBracketLink.findMany({ where: { toMatchId } })
  }

  async create(data: CreateMatchBracketLinkInput): Promise<MatchBracketLink> {
    return prisma.matchBracketLink.create({ data })
  }

  async delete(id: string): Promise<void> {
    await prisma.matchBracketLink.delete({ where: { id } })
  }
}
