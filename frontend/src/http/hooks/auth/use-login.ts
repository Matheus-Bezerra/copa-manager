import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { LoginBody, LoginResponse } from '../../types/auth/login';
import type { ApiErrorPayload } from '../../types/api-error';

export const loginMutationKey = () => [{ url: '/auth/login' }] as const;

export type LoginMutationKey = ReturnType<typeof loginMutationKey>;

export async function login(data: LoginBody) {
  const res = await client<LoginResponse, LoginBody>({
    method: 'POST',
    url: '/auth/login',
    data,
  });
  return res.data;
}

export function useLogin(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        LoginResponse,
        ResponseErrorConfig<ApiErrorPayload>,
        { data: LoginBody }
      >,
      'mutationKey' | 'mutationFn'
    >;
  },
) {
  return useMutation<
    LoginResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    { data: LoginBody }
  >({
    mutationKey: loginMutationKey(),
    mutationFn: ({ data }) => login(data),
    ...options?.mutation,
  });
}
