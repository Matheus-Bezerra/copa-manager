import type { QueryObserverOptions, UseQueryResult } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { FetchTieBreakerRulesResponse } from '../../types/rules/tie-breaker-rules';

export const fetchTieBreakerRulesQueryKey = (championshipId: string) =>
  [{ url: '/championships/:championshipId/rules/tie-breakers', championshipId }] as const;

export type FetchTieBreakerRulesQueryKey = ReturnType<typeof fetchTieBreakerRulesQueryKey>;

export async function fetchTieBreakerRules(championshipId: string) {
  const res = await client<FetchTieBreakerRulesResponse>({
    method: 'GET',
    url: `/championships/${championshipId}/rules/tie-breakers`,
  });
  return res.data;
}

export function fetchTieBreakerRulesQueryOptions(championshipId: string) {
  const queryKey = fetchTieBreakerRulesQueryKey(championshipId);

  return queryOptions<
    FetchTieBreakerRulesResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    FetchTieBreakerRulesResponse,
    FetchTieBreakerRulesQueryKey
  >({
    queryKey,
    queryFn: () => fetchTieBreakerRules(championshipId),
  });
}

export function useFetchTieBreakerRules(
  championshipId: string | null | undefined,
  options?: Partial<
    QueryObserverOptions<
      FetchTieBreakerRulesResponse,
      ResponseErrorConfig<ApiErrorPayload>,
      FetchTieBreakerRulesResponse,
      FetchTieBreakerRulesResponse,
      FetchTieBreakerRulesQueryKey
    >
  >,
) {
  const queryKey = championshipId
    ? (options?.queryKey ?? fetchTieBreakerRulesQueryKey(championshipId))
    : fetchTieBreakerRulesQueryKey('');

  return useQuery({
    ...fetchTieBreakerRulesQueryOptions(championshipId ?? ''),
    queryKey,
    enabled: !!championshipId && (options?.enabled ?? true),
    ...options,
  } as QueryObserverOptions) as UseQueryResult<
    FetchTieBreakerRulesResponse,
    ResponseErrorConfig<ApiErrorPayload>
  > & { queryKey: FetchTieBreakerRulesQueryKey };
}
