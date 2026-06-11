import type { QueryObserverOptions, UseQueryResult } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { GetChampionshipRulesResponse } from '../../types/rules/championship-rules';

export const getChampionshipRulesQueryKey = (championshipId: string) =>
  [{ url: '/championships/:championshipId/rules', championshipId }] as const;

export type GetChampionshipRulesQueryKey = ReturnType<typeof getChampionshipRulesQueryKey>;

export async function getChampionshipRules(championshipId: string) {
  const res = await client<GetChampionshipRulesResponse>({
    method: 'GET',
    url: `/championships/${championshipId}/rules`,
  });
  return res.data;
}

export function getChampionshipRulesQueryOptions(championshipId: string) {
  const queryKey = getChampionshipRulesQueryKey(championshipId);

  return queryOptions<
    GetChampionshipRulesResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    GetChampionshipRulesResponse,
    GetChampionshipRulesQueryKey
  >({
    queryKey,
    queryFn: () => getChampionshipRules(championshipId),
  });
}

export function useGetChampionshipRules(
  championshipId: string | null | undefined,
  options?: Partial<
    QueryObserverOptions<
      GetChampionshipRulesResponse,
      ResponseErrorConfig<ApiErrorPayload>,
      GetChampionshipRulesResponse,
      GetChampionshipRulesResponse,
      GetChampionshipRulesQueryKey
    >
  >,
) {
  const queryKey = championshipId
    ? (options?.queryKey ?? getChampionshipRulesQueryKey(championshipId))
    : getChampionshipRulesQueryKey('');

  return useQuery({
    ...getChampionshipRulesQueryOptions(championshipId ?? ''),
    queryKey,
    enabled: !!championshipId && (options?.enabled ?? true),
    ...options,
  } as QueryObserverOptions) as UseQueryResult<
    GetChampionshipRulesResponse,
    ResponseErrorConfig<ApiErrorPayload>
  > & { queryKey: GetChampionshipRulesQueryKey };
}
