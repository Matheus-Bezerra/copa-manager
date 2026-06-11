import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { UpdateTeamBody, UpdateTeamResponse } from '../../types/teams/update-team';

export const updateTeamMutationKey = () =>
  [{ url: '/championships/:championshipId/teams/:teamId' }] as const;

export type UpdateTeamMutationKey = ReturnType<typeof updateTeamMutationKey>;

export async function updateTeam(
  championshipId: string,
  teamId: string,
  data: UpdateTeamBody,
) {
  const res = await client<UpdateTeamResponse, UpdateTeamBody>({
    method: 'PUT',
    url: `/championships/${championshipId}/teams/${teamId}`,
    data,
  });
  return res.data;
}

export function useUpdateTeam(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        UpdateTeamResponse,
        ResponseErrorConfig<ApiErrorPayload>,
        { championshipId: string; teamId: string; data: UpdateTeamBody }
      >,
      'mutationKey' | 'mutationFn'
    >;
  },
) {
  return useMutation<
    UpdateTeamResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    { championshipId: string; teamId: string; data: UpdateTeamBody }
  >({
    mutationKey: updateTeamMutationKey(),
    mutationFn: ({ championshipId, teamId, data }) =>
      updateTeam(championshipId, teamId, data),
    ...options?.mutation,
  });
}
