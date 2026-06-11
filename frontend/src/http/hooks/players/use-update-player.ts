import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { UpdatePlayerBody, UpdatePlayerResponse } from '../../types/players/update-player';

export const updatePlayerMutationKey = () =>
  [{ url: '/championships/:championshipId/players/:playerId' }] as const;

export type UpdatePlayerMutationKey = ReturnType<typeof updatePlayerMutationKey>;

export async function updatePlayer(
  championshipId: string,
  playerId: string,
  data: UpdatePlayerBody,
) {
  const res = await client<UpdatePlayerResponse, UpdatePlayerBody>({
    method: 'PUT',
    url: `/championships/${championshipId}/players/${playerId}`,
    data,
  });
  return res.data;
}

export function useUpdatePlayer(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        UpdatePlayerResponse,
        ResponseErrorConfig<ApiErrorPayload>,
        { championshipId: string; playerId: string; data: UpdatePlayerBody }
      >,
      'mutationKey' | 'mutationFn'
    >;
  },
) {
  return useMutation<
    UpdatePlayerResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    { championshipId: string; playerId: string; data: UpdatePlayerBody }
  >({
    mutationKey: updatePlayerMutationKey(),
    mutationFn: ({ championshipId, playerId, data }) =>
      updatePlayer(championshipId, playerId, data),
    ...options?.mutation,
  });
}
