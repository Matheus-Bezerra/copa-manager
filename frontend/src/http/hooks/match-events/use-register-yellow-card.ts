import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type {
  RegisterYellowCardBody,
  RegisterYellowCardResponse,
} from '../../types/match-events/register-yellow-card';

export const registerYellowCardMutationKey = () =>
  [{ url: '/championships/:championshipId/matches/:matchId/events/yellow-card' }] as const;

export type RegisterYellowCardMutationKey = ReturnType<typeof registerYellowCardMutationKey>;

export async function registerYellowCard(
  championshipId: string,
  matchId: string,
  data: RegisterYellowCardBody,
) {
  const res = await client<RegisterYellowCardResponse, RegisterYellowCardBody>({
    method: 'POST',
    url: `/championships/${championshipId}/matches/${matchId}/events/yellow-card`,
    data,
  });
  return res.data;
}

export function useRegisterYellowCard(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        RegisterYellowCardResponse,
        ResponseErrorConfig<ApiErrorPayload>,
        { championshipId: string; matchId: string; data: RegisterYellowCardBody }
      >,
      'mutationKey' | 'mutationFn'
    >;
  },
) {
  return useMutation<
    RegisterYellowCardResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    { championshipId: string; matchId: string; data: RegisterYellowCardBody }
  >({
    mutationKey: registerYellowCardMutationKey(),
    mutationFn: ({ championshipId, matchId, data }) =>
      registerYellowCard(championshipId, matchId, data),
    ...options?.mutation,
  });
}
