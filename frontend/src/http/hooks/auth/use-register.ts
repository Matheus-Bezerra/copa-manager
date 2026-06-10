import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { RegisterBody, RegisterResponse } from '../../types/auth/register';
import type { ApiErrorPayload } from '../../types/api-error';

export const registerMutationKey = () => [{ url: '/auth/register' }] as const;

export type RegisterMutationKey = ReturnType<typeof registerMutationKey>;

export async function register(data: RegisterBody) {
  const res = await client<RegisterResponse, RegisterBody>({
    method: 'POST',
    url: '/auth/register',
    data,
  });
  return res.data;
}

export function useRegister(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        RegisterResponse,
        ResponseErrorConfig<ApiErrorPayload>,
        { data: RegisterBody }
      >,
      'mutationKey' | 'mutationFn'
    >;
  },
) {
  return useMutation<
    RegisterResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    { data: RegisterBody }
  >({
    mutationKey: registerMutationKey(),
    mutationFn: ({ data }) => register(data),
    ...options?.mutation,
  });
}
