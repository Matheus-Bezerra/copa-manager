import type { QueryObserverOptions, UseQueryResult } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { FetchStagesResponse } from '../../types/stages/fetch-stages';

export const fetchStagesQueryKey = (championshipId: string) =>
  [{ url: '/championships/:championshipId/stages', championshipId }] as const;

export type FetchStagesQueryKey = ReturnType<typeof fetchStagesQueryKey>;

export async function fetchStages(championshipId: string) {
  const res = await client<FetchStagesResponse>({
    method: 'GET',
    url: `/championships/${championshipId}/stages`,
  });
  return res.data;
}

export function fetchStagesQueryOptions(championshipId: string) {
  const queryKey = fetchStagesQueryKey(championshipId);

  return queryOptions<
    FetchStagesResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    FetchStagesResponse,
    FetchStagesQueryKey
  >({
    queryKey,
    queryFn: () => fetchStages(championshipId),
  });
}

export function useFetchStages(
  championshipId: string | null | undefined,
  options?: Partial<
    QueryObserverOptions<
      FetchStagesResponse,
      ResponseErrorConfig<ApiErrorPayload>,
      FetchStagesResponse,
      FetchStagesResponse,
      FetchStagesQueryKey
    >
  >,
) {
  const queryKey = championshipId
    ? (options?.queryKey ?? fetchStagesQueryKey(championshipId))
    : fetchStagesQueryKey('');

  return useQuery({
    ...fetchStagesQueryOptions(championshipId ?? ''),
    queryKey,
    enabled: !!championshipId && (options?.enabled ?? true),
    ...options,
  } as QueryObserverOptions) as UseQueryResult<
    FetchStagesResponse,
    ResponseErrorConfig<ApiErrorPayload>
  > & { queryKey: FetchStagesQueryKey };
}
