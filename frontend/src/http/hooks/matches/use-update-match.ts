import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { UpdateMatchBody, UpdateMatchResponse } from '../../types/matches/update-match';

export const updateMatchMutationKey = () =>
  [{ url: '/championships/:championshipId/matches/:matchId' }] as const;

export type UpdateMatchMutationKey = ReturnType<typeof updateMatchMutationKey>;

export async function updateMatch(
  championshipId: string,
  matchId: string,
  data: UpdateMatchBody,
) {
  const res = await client<UpdateMatchResponse, UpdateMatchBody>({
    method: 'PUT',
    url: `/championships/${championshipId}/matches/${matchId}`,
    data,
  });
  return res.data;
}

export function useUpdateMatch(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        UpdateMatchResponse,
        ResponseErrorConfig<ApiErrorPayload>,
        { championshipId: string; matchId: string; data: UpdateMatchBody }
      >,
      'mutationKey' | 'mutationFn'
    >;
  },
) {
  return useMutation<
    UpdateMatchResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    { championshipId: string; matchId: string; data: UpdateMatchBody }
  >({
    mutationKey: updateMatchMutationKey(),
    mutationFn: ({ championshipId, matchId, data }) =>
      updateMatch(championshipId, matchId, data),
    ...options?.mutation,
  });
}
