import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type {
  UpdateTieBreakerRulesBody,
  UpdateTieBreakerRulesResponse,
} from '../../types/rules/tie-breaker-rules';

export const updateTieBreakerRulesMutationKey = () =>
  [{ url: '/championships/:championshipId/rules/tie-breakers' }] as const;

export type UpdateTieBreakerRulesMutationKey = ReturnType<typeof updateTieBreakerRulesMutationKey>;

export async function updateTieBreakerRules(
  championshipId: string,
  data: UpdateTieBreakerRulesBody,
) {
  const res = await client<UpdateTieBreakerRulesResponse, UpdateTieBreakerRulesBody>({
    method: 'PUT',
    url: `/championships/${championshipId}/rules/tie-breakers`,
    data,
  });
  return res.data;
}

export function useUpdateTieBreakerRules(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        UpdateTieBreakerRulesResponse,
        ResponseErrorConfig<ApiErrorPayload>,
        { championshipId: string; data: UpdateTieBreakerRulesBody }
      >,
      'mutationKey' | 'mutationFn'
    >;
  },
) {
  return useMutation<
    UpdateTieBreakerRulesResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    { championshipId: string; data: UpdateTieBreakerRulesBody }
  >({
    mutationKey: updateTieBreakerRulesMutationKey(),
    mutationFn: ({ championshipId, data }) => updateTieBreakerRules(championshipId, data),
    ...options?.mutation,
  });
}
