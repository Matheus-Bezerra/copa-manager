import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type {
  CreateChampionshipBody,
  CreateChampionshipResponse,
} from '../../types/championships/create-championship';

export const createChampionshipMutationKey = () => [{ url: '/championships' }] as const;

export type CreateChampionshipMutationKey = ReturnType<typeof createChampionshipMutationKey>;

export async function createChampionship(data: CreateChampionshipBody) {
  const res = await client<CreateChampionshipResponse, CreateChampionshipBody>({
    method: 'POST',
    url: '/championships',
    data,
  });
  return res.data;
}

export function useCreateChampionship(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        CreateChampionshipResponse,
        ResponseErrorConfig<ApiErrorPayload>,
        { data: CreateChampionshipBody }
      >,
      'mutationKey' | 'mutationFn'
    >;
  },
) {
  return useMutation<
    CreateChampionshipResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    { data: CreateChampionshipBody }
  >({
    mutationKey: createChampionshipMutationKey(),
    mutationFn: ({ data }) => createChampionship(data),
    ...options?.mutation,
  });
}
