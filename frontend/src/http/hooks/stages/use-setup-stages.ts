import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { SetupStagesBody, SetupStagesResponse } from '../../types/stages/setup-stages';

export const setupStagesMutationKey = () =>
  [{ url: '/championships/:championshipId/stages/setup' }] as const;

export type SetupStagesMutationKey = ReturnType<typeof setupStagesMutationKey>;

export async function setupStages(championshipId: string, data: SetupStagesBody) {
  const res = await client<SetupStagesResponse, SetupStagesBody>({
    method: 'POST',
    url: `/championships/${championshipId}/stages/setup`,
    data,
  });
  return res.data;
}

export function useSetupStages(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        SetupStagesResponse,
        ResponseErrorConfig<ApiErrorPayload>,
        { championshipId: string; data: SetupStagesBody }
      >,
      'mutationKey' | 'mutationFn'
    >;
  },
) {
  return useMutation<
    SetupStagesResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    { championshipId: string; data: SetupStagesBody }
  >({
    mutationKey: setupStagesMutationKey(),
    mutationFn: ({ championshipId, data }) => setupStages(championshipId, data),
    ...options?.mutation,
  });
}
