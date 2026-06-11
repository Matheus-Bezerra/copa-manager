import type { QueryObserverOptions, UseQueryResult } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { GetMatchResponse } from '../../types/matches/get-match';

export const getMatchQueryKey = (championshipId: string, matchId: string) =>
  [{ url: '/championships/:championshipId/matches/:matchId', championshipId, matchId }] as const;

export type GetMatchQueryKey = ReturnType<typeof getMatchQueryKey>;

export async function getMatch(championshipId: string, matchId: string) {
  const res = await client<GetMatchResponse>({
    method: 'GET',
    url: `/championships/${championshipId}/matches/${matchId}`,
  });
  return res.data;
}

export function getMatchQueryOptions(championshipId: string, matchId: string) {
  const queryKey = getMatchQueryKey(championshipId, matchId);

  return queryOptions<
    GetMatchResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    GetMatchResponse,
    GetMatchQueryKey
  >({
    queryKey,
    queryFn: () => getMatch(championshipId, matchId),
  });
}

export function useGetMatch(
  championshipId: string | null | undefined,
  matchId: string | null | undefined,
  options?: Partial<
    QueryObserverOptions<
      GetMatchResponse,
      ResponseErrorConfig<ApiErrorPayload>,
      GetMatchResponse,
      GetMatchResponse,
      GetMatchQueryKey
    >
  >,
) {
  const queryKey =
    championshipId && matchId
      ? (options?.queryKey ?? getMatchQueryKey(championshipId, matchId))
      : getMatchQueryKey('', '');

  return useQuery({
    ...getMatchQueryOptions(championshipId ?? '', matchId ?? ''),
    queryKey,
    enabled: !!championshipId && !!matchId && (options?.enabled ?? true),
    ...options,
  } as QueryObserverOptions) as UseQueryResult<
    GetMatchResponse,
    ResponseErrorConfig<ApiErrorPayload>
  > & { queryKey: GetMatchQueryKey };
}
