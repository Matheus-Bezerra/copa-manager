import type { QueryObserverOptions, UseQueryResult } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { GetStandingsParams, GetStandingsResponse } from '../../types/standings/get-standings';
import type { StandingEntry } from '../../types/standings/standings';

export const getStandingsQueryKey = (params: GetStandingsParams) =>
  [
    {
      url: '/championships/:championshipId/standings',
      championshipId: params.championshipId,
      stageId: params.stageId,
      groupId: params.groupId,
    },
  ] as const;

export type GetStandingsQueryKey = ReturnType<typeof getStandingsQueryKey>;

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
