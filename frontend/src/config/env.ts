import { z } from '@/lib/zod';

const envSchema = z.object({
  VITE_API_URL: z.url(),
  VITE_ENABLE_API_DELAY: z
    .union([z.literal('true'), z.literal('false')])
    .default('false')
    .transform((value) => value === 'true'),
});

export const env = envSchema.parse(import.meta.env);
