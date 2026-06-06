import { z } from '@/lib/zod';
import { expandErrorResponses } from '@/utils/errors/expand-error-responses';
import { errorSchema } from '../common.schema';
import { passwordSchema } from './password.schema';
import { publicUserSchema } from './user.schema';

const registerResponseSchema = z.object({
  data: z.object({
    user: publicUserSchema,
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
});

export const registerSchema = {
  tags: ['Auth'],
  summary: 'Registrar usuário',
  operationId: 'register',
  body: z.object({
    name: z.string().trim().min(3),
    email: z.email(),
    password: passwordSchema,
  }),
  response: expandErrorResponses(
    { 201: registerResponseSchema },
    { '4xx': errorSchema, '5xx': errorSchema }
  ),
};

export type RegisterBody = z.infer<typeof registerSchema.body>;
