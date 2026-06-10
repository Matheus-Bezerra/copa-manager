import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { RefreshSessionBody, RefreshSessionResponse } from '../../types/auth/refresh-session';
import type { ApiErrorPayload } from '../../types/api-error';

export const refreshSessionMutationKey = () =>
  [{ url: '/auth/refresh' }] as const;

export type RefreshSessionMutationKey = ReturnType<typeof refreshSessionMutationKey>;

export async function refreshSession(data: RefreshSessionBody) {
  const res = await client<RefreshSessionResponse, RefreshSessionBody>({
    method: 'POST',
    url: '/auth/refresh',
    data,
  });
  return res.data;
}

export function useRefreshSession(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        RefreshSessionResponse,
        ResponseErrorConfig<ApiErrorPayload>,
        { data: RefreshSessionBody }
      >,
      'mutationKey' | 'mutationFn'
    >;
  },
) {
  return useMutation<
    RefreshSessionResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    { data: RefreshSessionBody }
  >({
    mutationKey: refreshSessionMutationKey(),
    mutationFn: ({ data }) => refreshSession(data),
    ...options?.mutation,
  });
}
