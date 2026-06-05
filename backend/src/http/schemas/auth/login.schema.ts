import { z } from '@/lib/zod';
import { expandErrorResponses } from '@/utils/errors/expand-error-responses';
import { errorSchema } from '../common.schema';

const publicUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  avatarUrl: z.string().nullable(),
});

const loginResponseSchema = z.object({
  data: z.object({
    user: publicUserSchema,
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
});

export const loginSchema = {
  tags: ['Auth'],
  summary: 'Login com email e senha',
  operationId: 'login',
  body: z.object({
    email: z.email(),
    password: z.string().min(1),
  }),
  response: expandErrorResponses(
    { 200: loginResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema }
  ),
};

export type LoginBody = z.infer<typeof loginSchema.body>;
