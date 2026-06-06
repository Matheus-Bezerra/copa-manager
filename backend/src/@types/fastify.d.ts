import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    getAuthContext: () => Promise<{ userId: string }>;
    verifyUserAvailability: () => Promise<{ userId: string }>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string };
    user: { sub: string };
  }
}

export {};
