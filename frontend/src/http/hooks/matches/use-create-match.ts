import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { invalidateMatchesQueries } from './use-fetch-matches';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { CreateMatchBody, CreateMatchResponse } from '../../types/matches/create-match';

export const createMatchMutationKey = () =>
  [{ url: '/championships/:championshipId/matches' }] as const;

export type CreateMatchMutationKey = ReturnType<typeof createMatchMutationKey>;

export async function createMatch(championshipId: string, data: CreateMatchBody) {
  const res = await client<CreateMatchResponse, CreateMatchBody>({
    method: 'POST',
    url: `/championships/${championshipId}/matches`,
    data,
  });
  return res.data;
}

type CreateMatchMutationOptions = UseMutationOptions<
  CreateMatchResponse,
  ResponseErrorConfig<ApiErrorPayload>,
  { championshipId: string; data: CreateMatchBody }
>;

export function useCreateMatch(
  options?: {
    mutation?: Omit<CreateMatchMutationOptions, 'mutationKey' | 'mutationFn'>;
  },
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options?.mutation ?? {};

  return useMutation<
    CreateMatchResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    { championshipId: string; data: CreateMatchBody }
  >({
    mutationKey: createMatchMutationKey(),
    mutationFn: ({ championshipId, data }) => createMatch(championshipId, data),
    ...mutationOptions,
    onSuccess: async (data, variables, context) => {
      await invalidateMatchesQueries(queryClient, variables.championshipId);
      await onSuccess?.(data, variables, context);
    },
  });
}
