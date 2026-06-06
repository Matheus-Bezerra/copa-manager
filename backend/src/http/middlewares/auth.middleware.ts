import type { FastifyInstance, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { errorMessage } from '@/constants/error-message';
import { PrismaUserRepository } from '@/prisma/repositories/prisma-user-repository';

async function authMiddleware(app: FastifyInstance) {
  const userRepository = new PrismaUserRepository();

  app.addHook('onRequest', async (request: FastifyRequest) => {
    request.getAuthContext = async () => {
      try {
        const payload = await request.jwtVerify<{ sub: string }>();
        return { userId: payload.sub };
      } catch {
        throw errorMessage.unauthorized;
      }
    };

    request.verifyUserAvailability = async () => {
      const { userId } = await request.getAuthContext();

      const user = await userRepository.findById(userId);

      if (!user) {
        throw errorMessage.userNotFound;
      }

      if (user.status === 'BLOCKED') {
        throw errorMessage.userBlocked;
      }

      return { userId: user.id };
    };
  });
}

export const auth = fp(authMiddleware);
