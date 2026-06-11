import type { QueryObserverOptions, UseQueryResult } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { Award } from '../../types/awards/award';
import type { FetchAwardsResponse } from '../../types/awards/fetch-awards';

export const fetchAwardsQueryKey = (championshipId: string) =>
  [{ url: '/championships/:championshipId/awards', championshipId }] as const;

export type FetchAwardsQueryKey = ReturnType<typeof fetchAwardsQueryKey>;

export async function fetchAwards(championshipId: string): Promise<FetchAwardsResponse> {
  const res = await client<Award[]>({
    method: 'GET',
    url: `/championships/${championshipId}/awards`,
  });
  return { awards: res.data };
}

export function fetchAwardsQueryOptions(championshipId: string) {
  const queryKey = fetchAwardsQueryKey(championshipId);

  return queryOptions<
    FetchAwardsResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    FetchAwardsResponse,
    FetchAwardsQueryKey
  >({
    queryKey,
    queryFn: () => fetchAwards(championshipId),
  });
}

export function useFetchAwards(
  championshipId: string | null | undefined,
  options?: Partial<
    QueryObserverOptions<
      FetchAwardsResponse,
      ResponseErrorConfig<ApiErrorPayload>,
      FetchAwardsResponse,
      FetchAwardsResponse,
      FetchAwardsQueryKey
    >
  >,
) {
  const queryKey = championshipId
    ? (options?.queryKey ?? fetchAwardsQueryKey(championshipId))
    : fetchAwardsQueryKey('');

  return useQuery({
    ...fetchAwardsQueryOptions(championshipId ?? ''),
    queryKey,
    enabled: !!championshipId && (options?.enabled ?? true),
    ...options,
  } as QueryObserverOptions) as UseQueryResult<
    FetchAwardsResponse,
    ResponseErrorConfig<ApiErrorPayload>
  > & { queryKey: FetchAwardsQueryKey };
}
