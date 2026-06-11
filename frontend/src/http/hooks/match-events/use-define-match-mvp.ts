import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type {
  DefineMatchMvpBody,
  DefineMatchMvpResponse,
} from '../../types/match-events/define-match-mvp';

export const defineMatchMvpMutationKey = () =>
  [{ url: '/championships/:championshipId/matches/:matchId/mvp' }] as const;

export type DefineMatchMvpMutationKey = ReturnType<typeof defineMatchMvpMutationKey>;

export async function defineMatchMvp(
  championshipId: string,
  matchId: string,
  data: DefineMatchMvpBody,
) {
  const res = await client<DefineMatchMvpResponse, DefineMatchMvpBody>({
    method: 'POST',
    url: `/championships/${championshipId}/matches/${matchId}/mvp`,
    data,
  });
  return res.data;
}

export function useDefineMatchMvp(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        DefineMatchMvpResponse,
        ResponseErrorConfig<ApiErrorPayload>,
        { championshipId: string; matchId: string; data: DefineMatchMvpBody }
      >,
      'mutationKey' | 'mutationFn'
    >;
  },
) {
  return useMutation<
    DefineMatchMvpResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    { championshipId: string; matchId: string; data: DefineMatchMvpBody }
  >({
    mutationKey: defineMatchMvpMutationKey(),
    mutationFn: ({ championshipId, matchId, data }) =>
      defineMatchMvp(championshipId, matchId, data),
    ...options?.mutation,
  });
}
