import Fastify from 'fastify';
import { registerCors } from './http/plugins/cors.js';
import { registerJwt } from './http/plugins/jwt.js';

export async function buildApp() {
  const app = Fastify({ logger: true });

  await registerCors(app);
  await registerJwt(app);

  app.get('/health', async () => ({ status: 'ok' }));
  
  return app;
}
