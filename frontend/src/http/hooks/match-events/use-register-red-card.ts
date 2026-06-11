import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type {
  RegisterRedCardBody,
  RegisterRedCardResponse,
} from '../../types/match-events/register-red-card';

export const registerRedCardMutationKey = () =>
  [{ url: '/championships/:championshipId/matches/:matchId/events/red-card' }] as const;

export type RegisterRedCardMutationKey = ReturnType<typeof registerRedCardMutationKey>;

export async function registerRedCard(
  championshipId: string,
  matchId: string,
  data: RegisterRedCardBody,
) {
  const res = await client<RegisterRedCardResponse, RegisterRedCardBody>({
    method: 'POST',
    url: `/championships/${championshipId}/matches/${matchId}/events/red-card`,
    data,
  });
  return res.data;
}

export function useRegisterRedCard(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        RegisterRedCardResponse,
        ResponseErrorConfig<ApiErrorPayload>,
        { championshipId: string; matchId: string; data: RegisterRedCardBody }
      >,
      'mutationKey' | 'mutationFn'
    >;
  },
) {
  return useMutation<
    RegisterRedCardResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    { championshipId: string; matchId: string; data: RegisterRedCardBody }
  >({
    mutationKey: registerRedCardMutationKey(),
    mutationFn: ({ championshipId, matchId, data }) =>
      registerRedCard(championshipId, matchId, data),
    ...options?.mutation,
  });
}
