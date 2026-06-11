import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ChangePasswordBody } from '../../types/auth/change-password';
import type { ApiErrorPayload } from '../../types/api-error';

export const changePasswordMutationKey = () =>
  [{ url: '/auth/change-password' }] as const;

export type ChangePasswordMutationKey = ReturnType<typeof changePasswordMutationKey>;

export async function changePassword(data: ChangePasswordBody) {
  await client<void, ChangePasswordBody>({
    method: 'POST',
    url: '/auth/change-password',
    data,
  });
}

export function useChangePassword(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        void,
        ResponseErrorConfig<ApiErrorPayload>,
        { data: ChangePasswordBody }
      >,
      'mutationKey' | 'mutationFn'
    >;
  },
) {
  return useMutation<void, ResponseErrorConfig<ApiErrorPayload>, { data: ChangePasswordBody }>({
    mutationKey: changePasswordMutationKey(),
    mutationFn: ({ data }) => changePassword(data),
    ...options?.mutation,
  });
}
