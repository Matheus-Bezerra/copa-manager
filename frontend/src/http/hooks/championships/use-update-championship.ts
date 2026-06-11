import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type {
  UpdateChampionshipBody,
  UpdateChampionshipResponse,
} from '../../types/championships/update-championship';

export const updateChampionshipMutationKey = () => [{ url: '/championships/:championshipId' }] as const;

export type UpdateChampionshipMutationKey = ReturnType<typeof updateChampionshipMutationKey>;

export async function updateChampionship(championshipId: string, data: UpdateChampionshipBody) {
  const res = await client<UpdateChampionshipResponse, UpdateChampionshipBody>({
    method: 'PUT',
    url: `/championships/${championshipId}`,
    data,
  });
  return res.data;
}

export function useUpdateChampionship(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        UpdateChampionshipResponse,
        ResponseErrorConfig<ApiErrorPayload>,
        { championshipId: string; data: UpdateChampionshipBody }
      >,
      'mutationKey' | 'mutationFn'
    >;
  },
) {
  return useMutation<
    UpdateChampionshipResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    { championshipId: string; data: UpdateChampionshipBody }
  >({
    mutationKey: updateChampionshipMutationKey(),
    mutationFn: ({ championshipId, data }) => updateChampionship(championshipId, data),
    ...options?.mutation,
  });
}
