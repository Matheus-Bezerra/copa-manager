import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { GrantAwardBody, GrantAwardResponse } from '../../types/awards/grant-award';

export const grantAwardMutationKey = () =>
  [{ url: '/championships/:championshipId/awards' }] as const;

export type GrantAwardMutationKey = ReturnType<typeof grantAwardMutationKey>;

export async function grantAward(championshipId: string, data: GrantAwardBody) {
  const res = await client<GrantAwardResponse, GrantAwardBody>({
    method: 'POST',
    url: `/championships/${championshipId}/awards`,
    data,
  });
  return res.data;
}

export function useGrantAward(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        GrantAwardResponse,
        ResponseErrorConfig<ApiErrorPayload>,
        { championshipId: string; data: GrantAwardBody }
      >,
      'mutationKey' | 'mutationFn'
    >;
  },
) {
  return useMutation<
    GrantAwardResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    { championshipId: string; data: GrantAwardBody }
  >({
    mutationKey: grantAwardMutationKey(),
    mutationFn: ({ championshipId, data }) => grantAward(championshipId, data),
    ...options?.mutation,
  });
}
