import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type {
  AcceptInvitationBody,
  AcceptInvitationResponse,
} from '../../types/members/accept-invitation';

export const acceptInvitationMutationKey = () => [{ url: '/invitations/accept' }] as const;

export type AcceptInvitationMutationKey = ReturnType<typeof acceptInvitationMutationKey>;

export async function acceptInvitation(data: AcceptInvitationBody) {
  const res = await client<AcceptInvitationResponse, AcceptInvitationBody>({
    method: 'POST',
    url: '/invitations/accept',
    data,
  });
  return res.data;
}

export function useAcceptInvitation(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        AcceptInvitationResponse,
        ResponseErrorConfig<ApiErrorPayload>,
        { data: AcceptInvitationBody }
      >,
      'mutationKey' | 'mutationFn'
    >;
  },
) {
  return useMutation<
    AcceptInvitationResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    { data: AcceptInvitationBody }
  >({
    mutationKey: acceptInvitationMutationKey(),
    mutationFn: ({ data }) => acceptInvitation(data),
    ...options?.mutation,
  });
}
