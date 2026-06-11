import type { QueryObserverOptions, UseQueryResult } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { FetchPublicPlayersResponse } from '../../types/public/public-players';

export const fetchPublicPlayersQueryKey = (slug: string) =>
  [{ url: '/public/championships/:slug/players', slug }] as const;

export type FetchPublicPlayersQueryKey = ReturnType<typeof fetchPublicPlayersQueryKey>;

export async function fetchPublicPlayers(slug: string) {
  const res = await client<FetchPublicPlayersResponse>({
    method: 'GET',
    url: `/public/championships/${slug}/players`,
  });
  return res.data;
}

export function fetchPublicPlayersQueryOptions(slug: string) {
  const queryKey = fetchPublicPlayersQueryKey(slug);

  return queryOptions<
    FetchPublicPlayersResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    FetchPublicPlayersResponse,
    FetchPublicPlayersQueryKey
  >({
    queryKey,
    queryFn: () => fetchPublicPlayers(slug),
  });
}

export function useFetchPublicPlayers(
  slug: string | null | undefined,
  options?: Partial<
    QueryObserverOptions<
      FetchPublicPlayersResponse,
      ResponseErrorConfig<ApiErrorPayload>,
      FetchPublicPlayersResponse,
      FetchPublicPlayersResponse,
      FetchPublicPlayersQueryKey
    >
  >,
) {
  const queryKey = slug
    ? (options?.queryKey ?? fetchPublicPlayersQueryKey(slug))
    : fetchPublicPlayersQueryKey('');

  return useQuery({
    ...fetchPublicPlayersQueryOptions(slug ?? ''),
    queryKey,
    enabled: !!slug && (options?.enabled ?? true),
    ...options,
  } as QueryObserverOptions) as UseQueryResult<
    FetchPublicPlayersResponse,
    ResponseErrorConfig<ApiErrorPayload>
  > & { queryKey: FetchPublicPlayersQueryKey };
}
