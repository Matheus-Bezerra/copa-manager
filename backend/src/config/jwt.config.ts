import jwt from '@fastify/jwt';
import type { FastifyInstance } from 'fastify';
import { env } from './env';

export async function registerJwt(app: FastifyInstance) {
  await app.register(jwt, { secret: env.JWT_SECRET });
}
