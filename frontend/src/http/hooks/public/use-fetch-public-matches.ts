import type { QueryObserverOptions, UseQueryResult } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { MatchListItem } from '../../types/matches/match';
import type {
  FetchPublicMatchesParams,
  FetchPublicMatchesResponse,
} from '../../types/public/public-matches';

export const fetchPublicMatchesQueryKey = (params: FetchPublicMatchesParams) =>
  [
    {
      url: '/public/championships/:slug/matches',
      slug: params.slug,
      roundId: params.roundId,
      groupId: params.groupId,
      status: params.status,
    },
  ] as const;

export type FetchPublicMatchesQueryKey = ReturnType<typeof fetchPublicMatchesQueryKey>;

export async function fetchPublicMatches(
  params: FetchPublicMatchesParams,
): Promise<FetchPublicMatchesResponse> {
  const res = await client<MatchListItem[]>({
    method: 'GET',
    url: `/public/championships/${params.slug}/matches`,
    params: {
      roundId: params.roundId,
      groupId: params.groupId,
      status: params.status,
    },
  });
  return { matches: res.data };
}

export function fetchPublicMatchesQueryOptions(params: FetchPublicMatchesParams) {
  const queryKey = fetchPublicMatchesQueryKey(params);

  return queryOptions<
    FetchPublicMatchesResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    FetchPublicMatchesResponse,
    FetchPublicMatchesQueryKey
  >({
    queryKey,
    queryFn: () => fetchPublicMatches(params),
  });
}

export function useFetchPublicMatches(
  params: FetchPublicMatchesParams | null | undefined,
  options?: Partial<
    QueryObserverOptions<
      FetchPublicMatchesResponse,
      ResponseErrorConfig<ApiErrorPayload>,
      FetchPublicMatchesResponse,
      FetchPublicMatchesResponse,
      FetchPublicMatchesQueryKey
    >
  >,
) {
  const queryParams = params ?? { slug: '' };
  const queryKey = params
    ? (options?.queryKey ?? fetchPublicMatchesQueryKey(queryParams))
    : fetchPublicMatchesQueryKey({ slug: '' });

  return useQuery({
    ...fetchPublicMatchesQueryOptions(queryParams),
    queryKey,
    enabled: !!params?.slug && (options?.enabled ?? true),
    ...options,
  } as QueryObserverOptions) as UseQueryResult<
    FetchPublicMatchesResponse,
    ResponseErrorConfig<ApiErrorPayload>
  > & { queryKey: FetchPublicMatchesQueryKey };
}
