import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type {
  UpdateMatchTimerBody,
  UpdateMatchTimerResponse,
} from '../../types/matches/update-match-timer';

export const updateMatchTimerMutationKey = () =>
  [{ url: '/championships/:championshipId/matches/:matchId/timer' }] as const;

export type UpdateMatchTimerMutationKey = ReturnType<typeof updateMatchTimerMutationKey>;

export async function updateMatchTimer(
  championshipId: string,
  matchId: string,
  data: UpdateMatchTimerBody,
) {
  const res = await client<UpdateMatchTimerResponse, UpdateMatchTimerBody>({
    method: 'PATCH',
    url: `/championships/${championshipId}/matches/${matchId}/timer`,
    data,
  });
  return res.data;
}

export function useUpdateMatchTimer(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        UpdateMatchTimerResponse,
        ResponseErrorConfig<ApiErrorPayload>,
        { championshipId: string; matchId: string; data: UpdateMatchTimerBody }
      >,
      'mutationKey' | 'mutationFn'
    >;
  },
) {
  return useMutation<
    UpdateMatchTimerResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    { championshipId: string; matchId: string; data: UpdateMatchTimerBody }
  >({
    mutationKey: updateMatchTimerMutationKey(),
    mutationFn: ({ championshipId, matchId, data }) =>
      updateMatchTimer(championshipId, matchId, data),
    ...options?.mutation,
  });
}
