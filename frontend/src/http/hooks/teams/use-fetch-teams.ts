import type { QueryObserverOptions, UseQueryResult } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { FetchTeamsResponse } from '../../types/teams/fetch-teams';

export const fetchTeamsQueryKey = (championshipId: string) =>
  [{ url: '/championships/:championshipId/teams', championshipId }] as const;

export type FetchTeamsQueryKey = ReturnType<typeof fetchTeamsQueryKey>;

export async function fetchTeams(championshipId: string) {
  const res = await client<FetchTeamsResponse>({
    method: 'GET',
    url: `/championships/${championshipId}/teams`,
  });
  return res.data;
}

export function fetchTeamsQueryOptions(championshipId: string) {
  const queryKey = fetchTeamsQueryKey(championshipId);

  return queryOptions<
    FetchTeamsResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    FetchTeamsResponse,
    FetchTeamsQueryKey
  >({
    queryKey,
    queryFn: () => fetchTeams(championshipId),
  });
}

export function useFetchTeams(
  championshipId: string | null | undefined,
  options?: Partial<
    QueryObserverOptions<
      FetchTeamsResponse,
      ResponseErrorConfig<ApiErrorPayload>,
      FetchTeamsResponse,
      FetchTeamsResponse,
      FetchTeamsQueryKey
    >
  >,
) {
  const queryKey = championshipId
    ? (options?.queryKey ?? fetchTeamsQueryKey(championshipId))
    : fetchTeamsQueryKey('');

  return useQuery({
    ...fetchTeamsQueryOptions(championshipId ?? ''),
    queryKey,
    enabled: !!championshipId && (options?.enabled ?? true),
    ...options,
  } as QueryObserverOptions) as UseQueryResult<
    FetchTeamsResponse,
    ResponseErrorConfig<ApiErrorPayload>
  > & { queryKey: FetchTeamsQueryKey };
}
