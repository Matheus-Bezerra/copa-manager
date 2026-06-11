import type { QueryObserverOptions, UseQueryResult } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { GetPublicStructureResponse } from '../../types/public/public-structure';

export const getPublicStructureQueryKey = (slug: string) =>
  [{ url: '/public/championships/:slug/structure', slug }] as const;

export type GetPublicStructureQueryKey = ReturnType<typeof getPublicStructureQueryKey>;

export async function getPublicStructure(slug: string) {
  const res = await client<GetPublicStructureResponse>({
    method: 'GET',
    url: `/public/championships/${slug}/structure`,
  });
  return res.data;
}

export function getPublicStructureQueryOptions(slug: string) {
  const queryKey = getPublicStructureQueryKey(slug);

  return queryOptions<
    GetPublicStructureResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    GetPublicStructureResponse,
    GetPublicStructureQueryKey
  >({
    queryKey,
    queryFn: () => getPublicStructure(slug),
  });
}

export function useGetPublicStructure(
  slug: string | null | undefined,
  options?: Partial<
    QueryObserverOptions<
      GetPublicStructureResponse,
      ResponseErrorConfig<ApiErrorPayload>,
      GetPublicStructureResponse,
      GetPublicStructureResponse,
      GetPublicStructureQueryKey
    >
  >,
) {
  const queryKey = slug
    ? (options?.queryKey ?? getPublicStructureQueryKey(slug))
    : getPublicStructureQueryKey('');

  return useQuery({
    ...getPublicStructureQueryOptions(slug ?? ''),
    queryKey,
    enabled: !!slug && (options?.enabled ?? true),
    ...options,
  } as QueryObserverOptions) as UseQueryResult<
    GetPublicStructureResponse,
    ResponseErrorConfig<ApiErrorPayload>
  > & { queryKey: GetPublicStructureQueryKey };
}
