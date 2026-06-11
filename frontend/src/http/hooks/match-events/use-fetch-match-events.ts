import type { QueryObserverOptions, UseQueryResult } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { FetchMatchEventsResponse } from '../../types/match-events/fetch-match-events';

export const fetchMatchEventsQueryKey = (championshipId: string, matchId: string) =>
  [
    { url: '/championships/:championshipId/matches/:matchId/events', championshipId, matchId },
  ] as const;

export type FetchMatchEventsQueryKey = ReturnType<typeof fetchMatchEventsQueryKey>;

export async function fetchMatchEvents(championshipId: string, matchId: string) {
  const res = await client<FetchMatchEventsResponse>({
    method: 'GET',
    url: `/championships/${championshipId}/matches/${matchId}/events`,
  });
  return res.data;
}

export function fetchMatchEventsQueryOptions(championshipId: string, matchId: string) {
  const queryKey = fetchMatchEventsQueryKey(championshipId, matchId);

  return queryOptions<
    FetchMatchEventsResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    FetchMatchEventsResponse,
    FetchMatchEventsQueryKey
  >({
    queryKey,
    queryFn: () => fetchMatchEvents(championshipId, matchId),
  });
}

export function useFetchMatchEvents(
  championshipId: string | null | undefined,
  matchId: string | null | undefined,
  options?: Partial<
    QueryObserverOptions<
      FetchMatchEventsResponse,
      ResponseErrorConfig<ApiErrorPayload>,
      FetchMatchEventsResponse,
      FetchMatchEventsResponse,
      FetchMatchEventsQueryKey
    >
  >,
) {
  const queryKey =
    championshipId && matchId
      ? (options?.queryKey ?? fetchMatchEventsQueryKey(championshipId, matchId))
      : fetchMatchEventsQueryKey('', '');

  return useQuery({
    ...fetchMatchEventsQueryOptions(championshipId ?? '', matchId ?? ''),
    queryKey,
    enabled: !!championshipId && !!matchId && (options?.enabled ?? true),
    ...options,
  } as QueryObserverOptions) as UseQueryResult<
    FetchMatchEventsResponse,
    ResponseErrorConfig<ApiErrorPayload>
  > & { queryKey: FetchMatchEventsQueryKey };
}
