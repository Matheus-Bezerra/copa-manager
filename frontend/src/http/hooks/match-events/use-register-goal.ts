import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { RegisterGoalBody, RegisterGoalResponse } from '../../types/match-events/register-goal';

export const registerGoalMutationKey = () =>
  [{ url: '/championships/:championshipId/matches/:matchId/events/goal' }] as const;

export type RegisterGoalMutationKey = ReturnType<typeof registerGoalMutationKey>;

export async function registerGoal(
  championshipId: string,
  matchId: string,
  data: RegisterGoalBody,
) {
  const res = await client<RegisterGoalResponse, RegisterGoalBody>({
    method: 'POST',
    url: `/championships/${championshipId}/matches/${matchId}/events/goal`,
    data,
  });
  return res.data;
}

export function useRegisterGoal(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        RegisterGoalResponse,
        ResponseErrorConfig<ApiErrorPayload>,
        { championshipId: string; matchId: string; data: RegisterGoalBody }
      >,
      'mutationKey' | 'mutationFn'
    >;
  },
) {
  return useMutation<
    RegisterGoalResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    { championshipId: string; matchId: string; data: RegisterGoalBody }
  >({
    mutationKey: registerGoalMutationKey(),
    mutationFn: ({ championshipId, matchId, data }) =>
      registerGoal(championshipId, matchId, data),
    ...options?.mutation,
  });
}
