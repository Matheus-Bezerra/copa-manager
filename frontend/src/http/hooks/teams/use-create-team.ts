import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { CreateTeamBody, CreateTeamResponse } from '../../types/teams/create-team';

export const createTeamMutationKey = () =>
  [{ url: '/championships/:championshipId/teams' }] as const;

export type CreateTeamMutationKey = ReturnType<typeof createTeamMutationKey>;

export async function createTeam(championshipId: string, data: CreateTeamBody) {
  const res = await client<CreateTeamResponse, CreateTeamBody>({
    method: 'POST',
    url: `/championships/${championshipId}/teams`,
    data,
  });
  return res.data;
}

export function useCreateTeam(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        CreateTeamResponse,
        ResponseErrorConfig<ApiErrorPayload>,
        { championshipId: string; data: CreateTeamBody }
      >,
      'mutationKey' | 'mutationFn'
    >;
  },
) {
  return useMutation<
    CreateTeamResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    { championshipId: string; data: CreateTeamBody }
  >({
    mutationKey: createTeamMutationKey(),
    mutationFn: ({ championshipId, data }) => createTeam(championshipId, data),
    ...options?.mutation,
  });
}
