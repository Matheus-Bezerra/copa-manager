import { prisma } from '@/lib/prisma'
import type {
  CreateMatchEventInput,
  MatchEvent,
  MatchEventRepository,
  MatchEventType,
} from '@/repositories/match-event-repository'

export class PrismaMatchEventRepository implements MatchEventRepository {
  async create(data: CreateMatchEventInput): Promise<MatchEvent> {
    return prisma.matchEvent.create({ data })
  }

  async findByMatchId(matchId: string): Promise<MatchEvent[]> {
    return prisma.matchEvent.findMany({
      where: { matchId },
      orderBy: { createdAt: 'asc' },
    })
  }

  async findByMatchIdAndType(matchId: string, eventType: MatchEventType): Promise<MatchEvent[]> {
    return prisma.matchEvent.findMany({
      where: { matchId, eventType },
      orderBy: { createdAt: 'asc' },
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.matchEvent.delete({ where: { id } })
  }
}
