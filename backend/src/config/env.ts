import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_DAYS: z.coerce.number().default(7),
  PASSWORD_RESET_EXPIRES_MINUTES: z.coerce.number().default(15),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM: z.string().min(1).default('onboarding@resend.dev'),
  APP_URL: z.url().default('http://localhost:5173'),
  ENABLE_SWAGGER: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('Invalid environment variables:', result.error.flatten().fieldErrors);
    process.exit(1);
  }

  return result.data;
}

export const env = parseEnv();
