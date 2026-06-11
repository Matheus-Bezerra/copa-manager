import type { QueryObserverOptions, UseQueryResult } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { FetchMembersResponse } from '../../types/members/fetch-members';

export const fetchMembersQueryKey = (championshipId: string) =>
  [{ url: '/championships/:championshipId/members', championshipId }] as const;

export type FetchMembersQueryKey = ReturnType<typeof fetchMembersQueryKey>;

export async function fetchMembers(championshipId: string) {
  const res = await client<FetchMembersResponse>({
    method: 'GET',
    url: `/championships/${championshipId}/members`,
  });
  return res.data;
}

export function fetchMembersQueryOptions(championshipId: string) {
  const queryKey = fetchMembersQueryKey(championshipId);

  return queryOptions<
    FetchMembersResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    FetchMembersResponse,
    FetchMembersQueryKey
  >({
    queryKey,
    queryFn: () => fetchMembers(championshipId),
  });
}

export function useFetchMembers(
  championshipId: string | null | undefined,
  options?: Partial<
    QueryObserverOptions<
      FetchMembersResponse,
      ResponseErrorConfig<ApiErrorPayload>,
      FetchMembersResponse,
      FetchMembersResponse,
      FetchMembersQueryKey
    >
  >,
) {
  const queryKey = championshipId
    ? (options?.queryKey ?? fetchMembersQueryKey(championshipId))
    : fetchMembersQueryKey('');

  return useQuery({
    ...fetchMembersQueryOptions(championshipId ?? ''),
    queryKey,
    enabled: !!championshipId && (options?.enabled ?? true),
    ...options,
  } as QueryObserverOptions) as UseQueryResult<
    FetchMembersResponse,
    ResponseErrorConfig<ApiErrorPayload>
  > & { queryKey: FetchMembersQueryKey };
}
