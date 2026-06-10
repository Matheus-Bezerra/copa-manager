import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { LogoutBody } from '../../types/auth/logout';
import type { ApiErrorPayload } from '../../types/api-error';

export const logoutMutationKey = () => [{ url: '/auth/logout' }] as const;

export type LogoutMutationKey = ReturnType<typeof logoutMutationKey>;

export async function logout(data: LogoutBody) {
  await client<void, LogoutBody>({
    method: 'POST',
    url: '/auth/logout',
    data,
  });
}

export function useLogout(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        void,
        ResponseErrorConfig<ApiErrorPayload>,
        { data: LogoutBody }
      >,
      'mutationKey' | 'mutationFn'
    >;
  },
) {
  return useMutation<void, ResponseErrorConfig<ApiErrorPayload>, { data: LogoutBody }>({
    mutationKey: logoutMutationKey(),
    mutationFn: ({ data }) => logout(data),
    ...options?.mutation,
  });
}
