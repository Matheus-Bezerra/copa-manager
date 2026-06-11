import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type {
  UpdateChampionshipRulesBody,
  UpdateChampionshipRulesResponse,
} from '../../types/rules/championship-rules';

export const updateChampionshipRulesMutationKey = () =>
  [{ url: '/championships/:championshipId/rules' }] as const;

export type UpdateChampionshipRulesMutationKey = ReturnType<
  typeof updateChampionshipRulesMutationKey
>;

export async function updateChampionshipRules(
  championshipId: string,
  data: UpdateChampionshipRulesBody,
) {
  const res = await client<UpdateChampionshipRulesResponse, UpdateChampionshipRulesBody>({
    method: 'PUT',
    url: `/championships/${championshipId}/rules`,
    data,
  });
  return res.data;
}

export function useUpdateChampionshipRules(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        UpdateChampionshipRulesResponse,
        ResponseErrorConfig<ApiErrorPayload>,
        { championshipId: string; data: UpdateChampionshipRulesBody }
      >,
      'mutationKey' | 'mutationFn'
    >;
  },
) {
  return useMutation<
    UpdateChampionshipRulesResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    { championshipId: string; data: UpdateChampionshipRulesBody }
  >({
    mutationKey: updateChampionshipRulesMutationKey(),
    mutationFn: ({ championshipId, data }) => updateChampionshipRules(championshipId, data),
    ...options?.mutation,
  });
}
