import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { invalidateMatchesQueries } from './use-fetch-matches';

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

type UpdateMatchMutationOptions = UseMutationOptions<
  UpdateMatchResponse,
  ResponseErrorConfig<ApiErrorPayload>,
  { championshipId: string; matchId: string; data: UpdateMatchBody }
>;

export function useUpdateMatch(
  options?: {
    mutation?: Omit<UpdateMatchMutationOptions, 'mutationKey' | 'mutationFn'>;
  },
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options?.mutation ?? {};

  return useMutation<
    UpdateMatchResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    { championshipId: string; matchId: string; data: UpdateMatchBody }
  >({
    mutationKey: updateMatchMutationKey(),
    mutationFn: ({ championshipId, matchId, data }) =>
      updateMatch(championshipId, matchId, data),
    ...mutationOptions,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await invalidateMatchesQueries(queryClient, variables.championshipId);
      await onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
