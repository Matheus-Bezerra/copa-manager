import { prisma } from '@/lib/prisma';
import type {
  CreateRefreshTokenInput,
  RefreshToken,
  RefreshTokenRepository,
  RefreshTokenWithUser,
} from '@/repositories/refresh-token-repository';

export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  async create(data: CreateRefreshTokenInput): Promise<RefreshToken> {
    return prisma.refreshToken.create({ data });
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshTokenWithUser | null> {
    return prisma.refreshToken.findFirst({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.refreshToken.delete({ where: { id } });
  }

  async deleteByTokenHash(tokenHash: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { tokenHash } });
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { userId } });
  }
}
