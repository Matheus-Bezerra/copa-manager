import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ApiErrorPayload } from '../../types/api-error';
import type {
  UpdateMemberRoleBody,
  UpdateMemberRoleResponse,
} from '../../types/members/update-member-role';

export const updateMemberRoleMutationKey = () =>
  [{ url: '/championships/:championshipId/members/:memberId' }] as const;

export type UpdateMemberRoleMutationKey = ReturnType<typeof updateMemberRoleMutationKey>;

export async function updateMemberRole(
  championshipId: string,
  memberId: string,
  data: UpdateMemberRoleBody,
) {
  const res = await client<UpdateMemberRoleResponse, UpdateMemberRoleBody>({
    method: 'PATCH',
    url: `/championships/${championshipId}/members/${memberId}`,
    data,
  });
  return res.data;
}

export function useUpdateMemberRole(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        UpdateMemberRoleResponse,
        ResponseErrorConfig<ApiErrorPayload>,
        { championshipId: string; memberId: string; data: UpdateMemberRoleBody }
      >,
      'mutationKey' | 'mutationFn'
    >;
  },
) {
  return useMutation<
    UpdateMemberRoleResponse,
    ResponseErrorConfig<ApiErrorPayload>,
    { championshipId: string; memberId: string; data: UpdateMemberRoleBody }
  >({
    mutationKey: updateMemberRoleMutationKey(),
    mutationFn: ({ championshipId, memberId, data }) =>
      updateMemberRole(championshipId, memberId, data),
    ...options?.mutation,
  });
}
