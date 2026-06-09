import { prisma } from '@/lib/prisma'
import type {
  CreateGroupInput,
  Group,
  GroupRepository,
  UpdateGroupInput,
} from '@/repositories/group-repository'

export class PrismaGroupRepository implements GroupRepository {
  async findById(id: string): Promise<Group | null> {
    return prisma.group.findUnique({ where: { id } })
  }

  async findByStageId(stageId: string): Promise<Group[]> {
    return prisma.group.findMany({
      where: { stageId },
      orderBy: { displayOrder: 'asc' },
    })
  }

  async findMaxDisplayOrder(stageId: string): Promise<number> {
    const result = await prisma.group.aggregate({
      where: { stageId },
      _max: { displayOrder: true },
    })
    return result._max.displayOrder ?? 0
  }

  async create(data: CreateGroupInput): Promise<Group> {
    return prisma.group.create({ data })
  }

  async update(id: string, data: UpdateGroupInput): Promise<Group> {
    return prisma.group.update({ where: { id }, data })
  }

  async delete(id: string): Promise<void> {
    await prisma.group.delete({ where: { id } })
  }
}
