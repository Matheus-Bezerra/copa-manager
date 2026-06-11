import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type {
  InviteMemberBody,
  InviteMemberResponse,
} from '../../types/members/invite-member';

export const inviteMemberMutationKey = () =>
  [{ url: '/championships/:championshipId/members/invite' }] as const;

export type InviteMemberMutationKey = ReturnType<typeof inviteMemberMutationKey>;

export async function inviteMember(championshipId: string, data: InviteMemberBody) {
  const res = await client<InviteMemberResponse, InviteMemberBody>({
    method: 'POST',
    url: `/championships/${championshipId}/members/invite`,
    data,
  });
  return res.data;
}

export function useInviteMember(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        InviteMemberResponse,
        ResponseErrorConfig<ApiErrorPayload>,
        { championshipId: string; data: InviteMemberBody }
      >,
      'mutationKey' | 'mutationFn'
    >;
  },
) {
  return useMutation<
    InviteMemberResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    { championshipId: string; data: InviteMemberBody }
  >({
    mutationKey: inviteMemberMutationKey(),
    mutationFn: ({ championshipId, data }) => inviteMember(championshipId, data),
    ...options?.mutation,
  });
}
