import { z } from '@/lib/zod';

export const errorSchema = z.object({
  code: z.string(),
  message: z.string(),
});
