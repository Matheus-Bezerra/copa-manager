import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { CreatePlayerBody, CreatePlayerResponse } from '../../types/players/create-player';

export const createPlayerMutationKey = () =>
  [{ url: '/championships/:championshipId/players' }] as const;

export type CreatePlayerMutationKey = ReturnType<typeof createPlayerMutationKey>;

export async function createPlayer(championshipId: string, data: CreatePlayerBody) {
  const res = await client<CreatePlayerResponse, CreatePlayerBody>({
    method: 'POST',
    url: `/championships/${championshipId}/players`,
    data,
  });
  return res.data;
}

export function useCreatePlayer(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        CreatePlayerResponse,
        ResponseErrorConfig<ApiErrorPayload>,
        { championshipId: string; data: CreatePlayerBody }
      >,
      'mutationKey' | 'mutationFn'
    >;
  },
) {
  return useMutation<
    CreatePlayerResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    { championshipId: string; data: CreatePlayerBody }
  >({
    mutationKey: createPlayerMutationKey(),
    mutationFn: ({ championshipId, data }) => createPlayer(championshipId, data),
    ...options?.mutation,
  });
}
