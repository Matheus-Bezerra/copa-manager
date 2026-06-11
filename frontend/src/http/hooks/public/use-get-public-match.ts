import type { QueryObserverOptions, UseQueryResult } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { GetPublicMatchResponse } from '../../types/public/get-public-match';

export const getPublicMatchQueryKey = (slug: string, matchId: string) =>
  [{ url: '/public/championships/:slug/matches/:matchId', slug, matchId }] as const;

export type GetPublicMatchQueryKey = ReturnType<typeof getPublicMatchQueryKey>;

export async function getPublicMatch(slug: string, matchId: string): Promise<GetPublicMatchResponse> {
  const res = await client<GetPublicMatchResponse>({
    method: 'GET',
    url: `/public/championships/${slug}/matches/${matchId}`,
  });
  return res.data;
}

export function getPublicMatchQueryOptions(slug: string, matchId: string) {
  const queryKey = getPublicMatchQueryKey(slug, matchId);

  return queryOptions<
    GetPublicMatchResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    GetPublicMatchResponse,
    GetPublicMatchQueryKey
  >({
    queryKey,
    queryFn: () => getPublicMatch(slug, matchId),
  });
}

export function useGetPublicMatch(
  slug: string | null | undefined,
  matchId: string | null | undefined,
  options?: Partial<
    QueryObserverOptions<
      GetPublicMatchResponse,
      ResponseErrorConfig<ApiErrorPayload>,
      GetPublicMatchResponse,
      GetPublicMatchResponse,
      GetPublicMatchQueryKey
    >
  >,
) {
  const queryKey =
    slug && matchId
      ? (options?.queryKey ?? getPublicMatchQueryKey(slug, matchId))
      : getPublicMatchQueryKey('', '');

  return useQuery({
    ...getPublicMatchQueryOptions(slug ?? '', matchId ?? ''),
    queryKey,
    enabled: !!slug && !!matchId && (options?.enabled ?? true),
    ...options,
  } as QueryObserverOptions) as UseQueryResult<
    GetPublicMatchResponse,
    ResponseErrorConfig<ApiErrorPayload>
  > & { queryKey: GetPublicMatchQueryKey };
}
