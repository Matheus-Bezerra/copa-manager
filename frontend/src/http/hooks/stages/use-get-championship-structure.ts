import type { QueryObserverOptions, UseQueryResult } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { GetChampionshipStructureResponse } from '../../types/stages/get-championship-structure';

export const getChampionshipStructureQueryKey = (championshipId: string) =>
  [{ url: '/championships/:championshipId/structure', championshipId }] as const;

export type GetChampionshipStructureQueryKey = ReturnType<
  typeof getChampionshipStructureQueryKey
>;

export async function getChampionshipStructure(championshipId: string) {
  const res = await client<GetChampionshipStructureResponse>({
    method: 'GET',
    url: `/championships/${championshipId}/structure`,
  });
  return res.data;
}

export function getChampionshipStructureQueryOptions(championshipId: string) {
  const queryKey = getChampionshipStructureQueryKey(championshipId);

  return queryOptions<
    GetChampionshipStructureResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    GetChampionshipStructureResponse,
    GetChampionshipStructureQueryKey
  >({
    queryKey,
    queryFn: () => getChampionshipStructure(championshipId),
  });
}

export function useGetChampionshipStructure(
  championshipId: string | null | undefined,
  options?: Partial<
    QueryObserverOptions<
      GetChampionshipStructureResponse,
      ResponseErrorConfig<ApiErrorPayload>,
      GetChampionshipStructureResponse,
      GetChampionshipStructureResponse,
      GetChampionshipStructureQueryKey
    >
  >,
) {
  const queryKey = championshipId
    ? (options?.queryKey ?? getChampionshipStructureQueryKey(championshipId))
    : getChampionshipStructureQueryKey('');

  return useQuery({
    ...getChampionshipStructureQueryOptions(championshipId ?? ''),
    queryKey,
    enabled: !!championshipId && (options?.enabled ?? true),
    ...options,
  } as QueryObserverOptions) as UseQueryResult<
    GetChampionshipStructureResponse,
    ResponseErrorConfig<ApiErrorPayload>
  > & { queryKey: GetChampionshipStructureQueryKey };
}
