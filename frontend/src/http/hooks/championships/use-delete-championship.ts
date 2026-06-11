import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { DeleteChampionshipResponse } from '../../types/championships/delete-championship';

export const deleteChampionshipMutationKey = () => [{ url: '/championships/:championshipId' }] as const;

export type DeleteChampionshipMutationKey = ReturnType<typeof deleteChampionshipMutationKey>;

export async function deleteChampionship(championshipId: string) {
  await client<DeleteChampionshipResponse>({
    method: 'DELETE',
    url: `/championships/${championshipId}`,
  });
}

export function useDeleteChampionship(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        DeleteChampionshipResponse,
        ResponseErrorConfig<ApiErrorPayload>,
        { championshipId: string }
      >,
      'mutationKey' | 'mutationFn'
    >;
  },
) {
  return useMutation<
    DeleteChampionshipResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    { championshipId: string }
  >({
    mutationKey: deleteChampionshipMutationKey(),
    mutationFn: ({ championshipId }) => deleteChampionship(championshipId),
    ...options?.mutation,
  });
}
