import type { QueryObserverOptions, UseQueryResult } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { FetchChampionshipsResponse } from '../../types/championships/fetch-championships';

export const fetchChampionshipsQueryKey = () => [{ url: '/championships' }] as const;

export type FetchChampionshipsQueryKey = ReturnType<typeof fetchChampionshipsQueryKey>;

export async function fetchChampionships() {
  const res = await client<FetchChampionshipsResponse>({
    method: 'GET',
    url: '/championships',
  });
  return res.data;
}

export function fetchChampionshipsQueryOptions() {
  const queryKey = fetchChampionshipsQueryKey();

  return queryOptions<
    FetchChampionshipsResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    FetchChampionshipsResponse,
    FetchChampionshipsQueryKey
  >({
    queryKey,
    queryFn: fetchChampionships,
  });
}

export function useFetchChampionships(
  options?: Partial<
    QueryObserverOptions<
      FetchChampionshipsResponse,
      ResponseErrorConfig<ApiErrorPayload>,
      FetchChampionshipsResponse,
      FetchChampionshipsResponse,
      FetchChampionshipsQueryKey
    >
  >,
) {
  const queryKey = options?.queryKey ?? fetchChampionshipsQueryKey();

  return useQuery({
    ...fetchChampionshipsQueryOptions(),
    queryKey,
    ...options,
  } as QueryObserverOptions) as UseQueryResult<
    FetchChampionshipsResponse,
    ResponseErrorConfig<ApiErrorPayload>
  > & { queryKey: FetchChampionshipsQueryKey };
}
