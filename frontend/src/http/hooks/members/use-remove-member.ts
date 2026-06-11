import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type { RemoveMemberResponse } from '../../types/members/remove-member';

export const removeMemberMutationKey = () =>
  [{ url: '/championships/:championshipId/members/:memberId' }] as const;

export type RemoveMemberMutationKey = ReturnType<typeof removeMemberMutationKey>;

export async function removeMember(championshipId: string, memberId: string) {
  await client<RemoveMemberResponse>({
    method: 'DELETE',
    url: `/championships/${championshipId}/members/${memberId}`,
  });
}

export function useRemoveMember(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        RemoveMemberResponse,
        ResponseErrorConfig<ApiErrorPayload>,
        { championshipId: string; memberId: string }
      >,
      'mutationKey' | 'mutationFn'
    >;
  },
) {
  return useMutation<
    RemoveMemberResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    { championshipId: string; memberId: string }
  >({
    mutationKey: removeMemberMutationKey(),
    mutationFn: ({ championshipId, memberId }) => removeMember(championshipId, memberId),
    ...options?.mutation,
  });
}
