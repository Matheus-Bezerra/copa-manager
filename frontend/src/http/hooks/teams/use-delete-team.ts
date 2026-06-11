import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { DeleteTeamResponse } from '../../types/teams/delete-team';

export const deleteTeamMutationKey = () =>
  [{ url: '/championships/:championshipId/teams/:teamId' }] as const;

export type DeleteTeamMutationKey = ReturnType<typeof deleteTeamMutationKey>;

export async function deleteTeam(championshipId: string, teamId: string) {
  await client<DeleteTeamResponse>({
    method: 'DELETE',
    url: `/championships/${championshipId}/teams/${teamId}`,
  });
}

export function useDeleteTeam(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        DeleteTeamResponse,
        ResponseErrorConfig<ApiErrorPayload>,
        { championshipId: string; teamId: string }
      >,
      'mutationKey' | 'mutationFn'
    >;
  },
) {
  return useMutation<
    DeleteTeamResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    { championshipId: string; teamId: string }
  >({
    mutationKey: deleteTeamMutationKey(),
    mutationFn: ({ championshipId, teamId }) => deleteTeam(championshipId, teamId),
    ...options?.mutation,
  });
}
