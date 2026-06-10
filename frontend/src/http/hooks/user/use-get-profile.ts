import type { QueryObserverOptions, UseQueryResult } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { GetProfileResponse } from '../../types/user/get-profile';

export const getProfileQueryKey = () => [{ url: '/me' }] as const;

export type GetProfileQueryKey = ReturnType<typeof getProfileQueryKey>;

export async function getProfile() {
  const res = await client<GetProfileResponse>({
    method: 'GET',
    url: '/me',
  });
  return res.data;
}

export function getProfileQueryOptions() {
  const queryKey = getProfileQueryKey();

  return queryOptions<
    GetProfileResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    GetProfileResponse,
    GetProfileQueryKey
  >({
    queryKey,
    queryFn: getProfile,
  });
}

export function useGetProfile(
  options?: Partial<
    QueryObserverOptions<
      GetProfileResponse,
      ResponseErrorConfig<ApiErrorPayload>,
      GetProfileResponse,
      GetProfileResponse,
      GetProfileQueryKey
    >
  >,
) {
  const queryKey = options?.queryKey ?? getProfileQueryKey();

  return useQuery({
    ...getProfileQueryOptions(),
    queryKey,
    ...options,
  } as QueryObserverOptions) as UseQueryResult<
    GetProfileResponse,
    ResponseErrorConfig<ApiErrorPayload>
  > & { queryKey: GetProfileQueryKey };
}
