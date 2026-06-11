import type { QueryObserverOptions, UseQueryResult } from '@tanstack/react-query';
import { queryOptions, useQuery } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { FetchPublicTeamsResponse, PublicTeam } from '../../types/public/public-teams';

export const fetchPublicTeamsQueryKey = (slug: string) =>
  [{ url: '/public/championships/:slug/teams', slug }] as const;

export type FetchPublicTeamsQueryKey = ReturnType<typeof fetchPublicTeamsQueryKey>;

export async function fetchPublicTeams(slug: string): Promise<FetchPublicTeamsResponse> {
  const res = await client<FetchPublicTeamsResponse>({
    method: 'GET',
    url: `/public/championships/${slug}/teams`,
  });
  return res.data;
}

export function fetchPublicTeamsQueryOptions(slug: string) {
  const queryKey = fetchPublicTeamsQueryKey(slug);

  return queryOptions<
    FetchPublicTeamsResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    FetchPublicTeamsResponse,
    FetchPublicTeamsQueryKey
  >({
    queryKey,
    queryFn: () => fetchPublicTeams(slug),
  });
}

export function useFetchPublicTeams(
  slug: string | null | undefined,
  options?: Partial<
    QueryObserverOptions<
      FetchPublicTeamsResponse,
      ResponseErrorConfig<ApiErrorPayload>,
      FetchPublicTeamsResponse,
      FetchPublicTeamsResponse,
      FetchPublicTeamsQueryKey
    >
  >,
) {
  const queryKey = slug ? (options?.queryKey ?? fetchPublicTeamsQueryKey(slug)) : fetchPublicTeamsQueryKey('');

  return useQuery({
    ...fetchPublicTeamsQueryOptions(slug ?? ''),
    queryKey,
    enabled: !!slug && (options?.enabled ?? true),
    ...options,
  } as QueryObserverOptions) as UseQueryResult<
    FetchPublicTeamsResponse,
    ResponseErrorConfig<ApiErrorPayload>
  > & { queryKey: FetchPublicTeamsQueryKey };
}

export function buildPublicTeamNameMap(teams: PublicTeam[]): Map<string, string> {
  return new Map(teams.map((team) => [team.id, team.name]));
}
