import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type {
  RegisterMatchResultBody,
  RegisterMatchResultResponse,
} from '../../types/matches/register-match-result';

export const registerMatchResultMutationKey = () =>
  [{ url: '/championships/:championshipId/matches/:matchId/result' }] as const;

export type RegisterMatchResultMutationKey = ReturnType<typeof registerMatchResultMutationKey>;

export async function registerMatchResult(
  championshipId: string,
  matchId: string,
  data: RegisterMatchResultBody,
) {
  const res = await client<RegisterMatchResultResponse, RegisterMatchResultBody>({
    method: 'POST',
    url: `/championships/${championshipId}/matches/${matchId}/result`,
    data,
  });
  return res.data;
}

export function useRegisterMatchResult(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        RegisterMatchResultResponse,
        ResponseErrorConfig<ApiErrorPayload>,
        { championshipId: string; matchId: string; data: RegisterMatchResultBody }
      >,
      'mutationKey' | 'mutationFn'
    >;
  },
) {
  return useMutation<
    RegisterMatchResultResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    { championshipId: string; matchId: string; data: RegisterMatchResultBody }
  >({
    mutationKey: registerMatchResultMutationKey(),
    mutationFn: ({ championshipId, matchId, data }) =>
      registerMatchResult(championshipId, matchId, data),
    ...options?.mutation,
  });
}
