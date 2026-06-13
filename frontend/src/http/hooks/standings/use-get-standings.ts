import type { QueryClient, QueryObserverOptions, UseQueryResult } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { GetStandingsParams, GetStandingsResponse } from '../../types/standings/get-standings';
import type { StandingEntry } from '../../types/standings/standings';

const STANDINGS_LIST_URL = '/championships/:championshipId/standings';

export const getStandingsQueryKey = (params: GetStandingsParams) =>
  [
    {
      url: STANDINGS_LIST_URL,
      championshipId: params.championshipId,
      stageId: params.stageId,
      groupId: params.groupId,
    },
  ] as const;

export type GetStandingsQueryKey = ReturnType<typeof getStandingsQueryKey>;

export function isGetStandingsQueryKey(
  queryKey: readonly unknown[],
  championshipId: string,
): boolean {
  const first = queryKey[0];

  return (
    typeof first === 'object' &&
    first !== null &&
    'url' in first &&
    first.url === STANDINGS_LIST_URL &&
    'championshipId' in first &&
    first.championshipId === championshipId
  );
}

export function invalidateStandingsQueries(queryClient: QueryClient, championshipId: string) {
  return queryClient.invalidateQueries({
    predicate: (query) => isGetStandingsQueryKey(query.queryKey, championshipId),
    refetchType: 'all',
  });
}

export async function getStandings(params: GetStandingsParams): Promise<GetStandingsResponse> {
  const res = await client<StandingEntry[]>({
    method: 'GET',
    url: `/championships/${params.championshipId}/standings`,
    params: { stageId: params.stageId, groupId: params.groupId },
  });
  return { standings: res.data };
}

export function getStandingsQueryOptions(params: GetStandingsParams) {
  const queryKey = getStandingsQueryKey(params);

  return queryOptions<
    GetStandingsResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    GetStandingsResponse,
    GetStandingsQueryKey
  >({
    queryKey,
    queryFn: () => getStandings(params),
  });
}

export function useGetStandings(
  params: GetStandingsParams | null | undefined,
  options?: Partial<
    QueryObserverOptions<
      GetStandingsResponse,
      ResponseErrorConfig<ApiErrorPayload>,
      GetStandingsResponse,
      GetStandingsResponse,
      GetStandingsQueryKey
    >
  >,
) {
  const queryParams = params ?? { championshipId: '', stageId: '', groupId: '' };
  const queryKey = params
    ? (options?.queryKey ?? getStandingsQueryKey(queryParams))
    : getStandingsQueryKey({ championshipId: '', stageId: '', groupId: '' });

  return useQuery({
    ...getStandingsQueryOptions(queryParams),
    queryKey,
    enabled:
      !!params?.championshipId &&
      !!params?.stageId &&
      !!params?.groupId &&
      (options?.enabled ?? true),
    ...options,
  } as QueryObserverOptions) as UseQueryResult<
    GetStandingsResponse,
    ResponseErrorConfig<ApiErrorPayload>
  > & { queryKey: GetStandingsQueryKey };
}
