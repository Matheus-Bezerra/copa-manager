import type { QueryClient, QueryObserverOptions, UseQueryResult } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { FetchMatchesParams, FetchMatchesResponse } from '../../types/matches/fetch-matches';

export const fetchMatchesQueryKey = (params: FetchMatchesParams) =>
  [
    {
      url: MATCHES_LIST_URL,
      ...params,
    },
  ] as const;

export type FetchMatchesQueryKey = ReturnType<typeof fetchMatchesQueryKey>;

const MATCHES_LIST_URL = '/championships/:championshipId/matches';

export function isFetchMatchesQueryKey(
  queryKey: readonly unknown[],
  championshipId: string,
): boolean {
  const first = queryKey[0];

  return (
    typeof first === 'object' &&
    first !== null &&
    'url' in first &&
    first.url === MATCHES_LIST_URL &&
    'championshipId' in first &&
    first.championshipId === championshipId
  );
}

export function invalidateMatchesQueries(queryClient: QueryClient, championshipId: string) {
  return queryClient.invalidateQueries({
    predicate: (query) => isFetchMatchesQueryKey(query.queryKey, championshipId),
    refetchType: 'all',
  });
}

export async function fetchMatches(params: FetchMatchesParams) {
  const { championshipId, ...queryParams } = params;
  const res = await client<FetchMatchesResponse>({
    method: 'GET',
    url: `/championships/${championshipId}/matches`,
    params: queryParams,
  });
  return res.data;
}

export function fetchMatchesQueryOptions(params: FetchMatchesParams) {
  const queryKey = fetchMatchesQueryKey(params);

  return queryOptions<
    FetchMatchesResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    FetchMatchesResponse,
    FetchMatchesQueryKey
  >({
    queryKey,
    queryFn: () => fetchMatches(params),
  });
}

export function useFetchMatches(
  params: FetchMatchesParams | null | undefined,
  options?: Partial<
    QueryObserverOptions<
      FetchMatchesResponse,
      ResponseErrorConfig<ApiErrorPayload>,
      FetchMatchesResponse,
      FetchMatchesResponse,
      FetchMatchesQueryKey
    >
  >,
) {
  const safeParams = params ?? { championshipId: '' };
  const queryKey = params
    ? (options?.queryKey ?? fetchMatchesQueryKey(safeParams))
    : fetchMatchesQueryKey({ championshipId: '' });

  return useQuery({
    ...fetchMatchesQueryOptions(safeParams),
    queryKey,
    enabled: !!params?.championshipId && (options?.enabled ?? true),
    ...options,
  } as QueryObserverOptions) as UseQueryResult<
    FetchMatchesResponse,
    ResponseErrorConfig<ApiErrorPayload>
  > & { queryKey: FetchMatchesQueryKey };
}
