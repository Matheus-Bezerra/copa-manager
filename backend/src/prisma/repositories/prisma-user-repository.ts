import { prisma } from '@/lib/prisma';
import type {
  CreateUserInput,
  User,
  UserRepository,
} from '@/repositories/user-repository';

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async create(data: CreateUserInput): Promise<User> {
    return prisma.user.create({ data });
  }
}
