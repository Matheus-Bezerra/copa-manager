import type { QueryObserverOptions, UseQueryResult } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type {
  GetPublicStandingsParams,
  GetPublicStandingsResponse,
} from '../../types/public/public-standings';
import type { StandingEntry } from '../../types/standings/standings';

export const getPublicStandingsQueryKey = (params: GetPublicStandingsParams) =>
  [
    {
      url: '/public/championships/:slug/standings',
      slug: params.slug,
      stageId: params.stageId,
      groupId: params.groupId,
    },
  ] as const;

export type GetPublicStandingsQueryKey = ReturnType<typeof getPublicStandingsQueryKey>;

export async function getPublicStandings(
  params: GetPublicStandingsParams,
): Promise<GetPublicStandingsResponse> {
  const res = await client<StandingEntry[]>({
    method: 'GET',
    url: `/public/championships/${params.slug}/standings`,
    params: { stageId: params.stageId, groupId: params.groupId },
  });
  return { standings: res.data };
}

export function getPublicStandingsQueryOptions(params: GetPublicStandingsParams) {
  const queryKey = getPublicStandingsQueryKey(params);

  return queryOptions<
    GetPublicStandingsResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    GetPublicStandingsResponse,
    GetPublicStandingsQueryKey
  >({
    queryKey,
    queryFn: () => getPublicStandings(params),
  });
}

export function useGetPublicStandings(
  params: GetPublicStandingsParams | null | undefined,
  options?: Partial<
    QueryObserverOptions<
      GetPublicStandingsResponse,
      ResponseErrorConfig<ApiErrorPayload>,
      GetPublicStandingsResponse,
      GetPublicStandingsResponse,
      GetPublicStandingsQueryKey
    >
  >,
) {
  const queryParams = params ?? { slug: '', stageId: '', groupId: '' };
  const queryKey = params
    ? (options?.queryKey ?? getPublicStandingsQueryKey(queryParams))
    : getPublicStandingsQueryKey({ slug: '', stageId: '', groupId: '' });

  return useQuery({
    ...getPublicStandingsQueryOptions(queryParams),
    queryKey,
    enabled:
      !!params?.slug &&
      !!params?.stageId &&
      !!params?.groupId &&
      (options?.enabled ?? true),
    ...options,
  } as QueryObserverOptions) as UseQueryResult<
    GetPublicStandingsResponse,
    ResponseErrorConfig<ApiErrorPayload>
  > & { queryKey: GetPublicStandingsQueryKey };
}
