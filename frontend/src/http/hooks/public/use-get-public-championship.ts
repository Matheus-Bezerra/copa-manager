import type { QueryObserverOptions, UseQueryResult } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { GetPublicChampionshipResponse } from '../../types/public/public-championship';

export const getPublicChampionshipQueryKey = (slug: string) =>
  [{ url: '/public/championships/:slug', slug }] as const;

export type GetPublicChampionshipQueryKey = ReturnType<typeof getPublicChampionshipQueryKey>;

export async function getPublicChampionship(slug: string) {
  const res = await client<GetPublicChampionshipResponse>({
    method: 'GET',
    url: `/public/championships/${slug}`,
  });
  return res.data;
}

export function getPublicChampionshipQueryOptions(slug: string) {
  const queryKey = getPublicChampionshipQueryKey(slug);

  return queryOptions<
    GetPublicChampionshipResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    GetPublicChampionshipResponse,
    GetPublicChampionshipQueryKey
  >({
    queryKey,
    queryFn: () => getPublicChampionship(slug),
  });
}

export function useGetPublicChampionship(
  slug: string | null | undefined,
  options?: Partial<
    QueryObserverOptions<
      GetPublicChampionshipResponse,
      ResponseErrorConfig<ApiErrorPayload>,
      GetPublicChampionshipResponse,
      GetPublicChampionshipResponse,
      GetPublicChampionshipQueryKey
    >
  >,
) {
  const queryKey = slug
    ? (options?.queryKey ?? getPublicChampionshipQueryKey(slug))
    : getPublicChampionshipQueryKey('');

  return useQuery({
    ...getPublicChampionshipQueryOptions(slug ?? ''),
    queryKey,
    enabled: !!slug && (options?.enabled ?? true),
    ...options,
  } as QueryObserverOptions) as UseQueryResult<
    GetPublicChampionshipResponse,
    ResponseErrorConfig<ApiErrorPayload>
  > & { queryKey: GetPublicChampionshipQueryKey };
}
