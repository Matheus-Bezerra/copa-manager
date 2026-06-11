import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type {
  UpdateMatchStatusBody,
  UpdateMatchStatusResponse,
} from '../../types/matches/update-match-status';

export const updateMatchStatusMutationKey = () =>
  [{ url: '/championships/:championshipId/matches/:matchId/status' }] as const;

export type UpdateMatchStatusMutationKey = ReturnType<typeof updateMatchStatusMutationKey>;

export async function updateMatchStatus(
  championshipId: string,
  matchId: string,
  data: UpdateMatchStatusBody,
) {
  const res = await client<UpdateMatchStatusResponse, UpdateMatchStatusBody>({
    method: 'PATCH',
    url: `/championships/${championshipId}/matches/${matchId}/status`,
    data,
  });
  return res.data;
}

export function useUpdateMatchStatus(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        UpdateMatchStatusResponse,
        ResponseErrorConfig<ApiErrorPayload>,
        { championshipId: string; matchId: string; data: UpdateMatchStatusBody }
      >,
      'mutationKey' | 'mutationFn'
    >;
  },
) {
  return useMutation<
    UpdateMatchStatusResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    { championshipId: string; matchId: string; data: UpdateMatchStatusBody }
  >({
    mutationKey: updateMatchStatusMutationKey(),
    mutationFn: ({ championshipId, matchId, data }) =>
      updateMatchStatus(championshipId, matchId, data),
    ...options?.mutation,
  });
}
