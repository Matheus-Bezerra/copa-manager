import { prisma } from '@/lib/prisma';
import type {
  Championship,
  ChampionshipRepository,
  CreateChampionshipInput,
  UpdateChampionshipInput,
} from '@/repositories/championship-repository';

export class PrismaChampionshipRepository implements ChampionshipRepository {
  async findById(id: string): Promise<Championship | null> {
    return prisma.championship.findUnique({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Championship | null> {
    return prisma.championship.findUnique({ where: { slug } });
  }

  async findByUserId(userId: string): Promise<Championship[]> {
    return prisma.championship.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async slugExists(slug: string): Promise<boolean> {
    const championship = await prisma.championship.findUnique({
      where: { slug },
      select: { id: true },
    });

    return championship !== null;
  }

  async create(data: CreateChampionshipInput): Promise<Championship> {
    return prisma.championship.create({ data });
  }

  async update(id: string, data: UpdateChampionshipInput): Promise<Championship> {
    return prisma.championship.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.championship.delete({ where: { id } });
  }
}
