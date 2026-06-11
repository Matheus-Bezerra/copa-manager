import type { QueryObserverOptions, UseQueryResult } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { GetChampionshipResponse } from '../../types/championships/get-championship';

export const getChampionshipQueryKey = (championshipId: string) =>
  [{ url: '/championships/:championshipId', championshipId }] as const;

export type GetChampionshipQueryKey = ReturnType<typeof getChampionshipQueryKey>;

export async function getChampionship(championshipId: string) {
  const res = await client<GetChampionshipResponse>({
    method: 'GET',
    url: `/championships/${championshipId}`,
  });
  return res.data;
}

export function getChampionshipQueryOptions(championshipId: string) {
  const queryKey = getChampionshipQueryKey(championshipId);

  return queryOptions<
    GetChampionshipResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    GetChampionshipResponse,
    GetChampionshipQueryKey
  >({
    queryKey,
    queryFn: () => getChampionship(championshipId),
  });
}

export function useGetChampionship(
  championshipId: string | null | undefined,
  options?: Partial<
    QueryObserverOptions<
      GetChampionshipResponse,
      ResponseErrorConfig<ApiErrorPayload>,
      GetChampionshipResponse,
      GetChampionshipResponse,
      GetChampionshipQueryKey
    >
  >,
) {
  const queryKey = championshipId
    ? (options?.queryKey ?? getChampionshipQueryKey(championshipId))
    : getChampionshipQueryKey('');

  return useQuery({
    ...getChampionshipQueryOptions(championshipId ?? ''),
    queryKey,
    enabled: !!championshipId && (options?.enabled ?? true),
    ...options,
  } as QueryObserverOptions) as UseQueryResult<
    GetChampionshipResponse,
    ResponseErrorConfig<ApiErrorPayload>
  > & { queryKey: GetChampionshipQueryKey };
}
