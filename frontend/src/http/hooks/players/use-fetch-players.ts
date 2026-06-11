import type { QueryObserverOptions, UseQueryResult } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { FetchPlayersResponse } from '../../types/players/fetch-players';

export const fetchPlayersQueryKey = (championshipId: string) =>
  [{ url: '/championships/:championshipId/players', championshipId }] as const;

export type FetchPlayersQueryKey = ReturnType<typeof fetchPlayersQueryKey>;

export async function fetchPlayers(championshipId: string) {
  const res = await client<FetchPlayersResponse>({
    method: 'GET',
    url: `/championships/${championshipId}/players`,
  });
  return res.data;
}

export function fetchPlayersQueryOptions(championshipId: string) {
  const queryKey = fetchPlayersQueryKey(championshipId);

  return queryOptions<
    FetchPlayersResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    FetchPlayersResponse,
    FetchPlayersQueryKey
  >({
    queryKey,
    queryFn: () => fetchPlayers(championshipId),
  });
}

export function useFetchPlayers(
  championshipId: string | null | undefined,
  options?: Partial<
    QueryObserverOptions<
      FetchPlayersResponse,
      ResponseErrorConfig<ApiErrorPayload>,
      FetchPlayersResponse,
      FetchPlayersResponse,
      FetchPlayersQueryKey
    >
  >,
) {
  const queryKey = championshipId
    ? (options?.queryKey ?? fetchPlayersQueryKey(championshipId))
    : fetchPlayersQueryKey('');

  return useQuery({
    ...fetchPlayersQueryOptions(championshipId ?? ''),
    queryKey,
    enabled: !!championshipId && (options?.enabled ?? true),
    ...options,
  } as QueryObserverOptions) as UseQueryResult<
    FetchPlayersResponse,
    ResponseErrorConfig<ApiErrorPayload>
  > & { queryKey: FetchPlayersQueryKey };
}
