import { prisma } from '@/lib/prisma';
import type {
  CreatePasswordResetTokenInput,
  PasswordResetToken,
  PasswordResetTokenRepository,
  PasswordResetTokenWithUser,
} from '@/repositories/password-reset-token-repository';

export class PrismaPasswordResetTokenRepository implements PasswordResetTokenRepository {
  async create(data: CreatePasswordResetTokenInput): Promise<PasswordResetToken> {
    return prisma.passwordResetToken.create({ data });
  }

  async findValidByCode(code: string): Promise<PasswordResetTokenWithUser | null> {
    return prisma.passwordResetToken.findFirst({
      where: {
        code,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          },
        },
      },
    });
  }

  async markAsUsed(id: string): Promise<void> {
    await prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  async deleteUnusedByUserId(userId: string): Promise<void> {
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId,
        usedAt: null,
      },
    });
  }
}
