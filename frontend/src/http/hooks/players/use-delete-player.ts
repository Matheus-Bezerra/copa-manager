import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { DeletePlayerResponse } from '../../types/players/delete-player';

export const deletePlayerMutationKey = () =>
  [{ url: '/championships/:championshipId/players/:playerId' }] as const;

export type DeletePlayerMutationKey = ReturnType<typeof deletePlayerMutationKey>;

export async function deletePlayer(championshipId: string, playerId: string) {
  await client<DeletePlayerResponse>({
    method: 'DELETE',
    url: `/championships/${championshipId}/players/${playerId}`,
  });
}

export function useDeletePlayer(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        DeletePlayerResponse,
        ResponseErrorConfig<ApiErrorPayload>,
        { championshipId: string; playerId: string }
      >,
      'mutationKey' | 'mutationFn'
    >;
  },
) {
  return useMutation<
    DeletePlayerResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    { championshipId: string; playerId: string }
  >({
    mutationKey: deletePlayerMutationKey(),
    mutationFn: ({ championshipId, playerId }) => deletePlayer(championshipId, playerId),
    ...options?.mutation,
  });
}
