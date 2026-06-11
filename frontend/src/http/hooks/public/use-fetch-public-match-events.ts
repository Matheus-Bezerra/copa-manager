import type { QueryObserverOptions, UseQueryResult } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type {
  FetchPublicMatchEventsParams,
  FetchPublicMatchEventsResponse,
} from '../../types/public/public-match-events';

export const fetchPublicMatchEventsQueryKey = (params: FetchPublicMatchEventsParams) =>
  [
    {
      url: '/public/championships/:slug/matches/:matchId/events',
      slug: params.slug,
      matchId: params.matchId,
    },
  ] as const;

export type FetchPublicMatchEventsQueryKey = ReturnType<typeof fetchPublicMatchEventsQueryKey>;

export async function fetchPublicMatchEvents(
  params: FetchPublicMatchEventsParams,
): Promise<FetchPublicMatchEventsResponse> {
  const res = await client<FetchPublicMatchEventsResponse>({
    method: 'GET',
    url: `/public/championships/${params.slug}/matches/${params.matchId}/events`,
  });
  return res.data;
}

export function fetchPublicMatchEventsQueryOptions(params: FetchPublicMatchEventsParams) {
  const queryKey = fetchPublicMatchEventsQueryKey(params);

  return queryOptions<
    FetchPublicMatchEventsResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    FetchPublicMatchEventsResponse,
    FetchPublicMatchEventsQueryKey
  >({
    queryKey,
    queryFn: () => fetchPublicMatchEvents(params),
  });
}

export function useFetchPublicMatchEvents(
  params: FetchPublicMatchEventsParams | null | undefined,
  options?: Partial<
    QueryObserverOptions<
      FetchPublicMatchEventsResponse,
      ResponseErrorConfig<ApiErrorPayload>,
      FetchPublicMatchEventsResponse,
      FetchPublicMatchEventsResponse,
      FetchPublicMatchEventsQueryKey
    >
  >,
) {
  const queryParams = params ?? { slug: '', matchId: '' };
  const queryKey = params
    ? (options?.queryKey ?? fetchPublicMatchEventsQueryKey(queryParams))
    : fetchPublicMatchEventsQueryKey({ slug: '', matchId: '' });

  return useQuery({
    ...fetchPublicMatchEventsQueryOptions(queryParams),
    queryKey,
    enabled: !!params?.slug && !!params?.matchId && (options?.enabled ?? true),
    ...options,
  } as QueryObserverOptions) as UseQueryResult<
    FetchPublicMatchEventsResponse,
    ResponseErrorConfig<ApiErrorPayload>
  > & { queryKey: FetchPublicMatchEventsQueryKey };
}
