import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ResetPasswordBody } from '../../types/auth/reset-password';
import type { ApiErrorPayload } from '../../types/api-error';

export const resetPasswordMutationKey = () =>
  [{ url: '/auth/reset-password' }] as const;

export type ResetPasswordMutationKey = ReturnType<typeof resetPasswordMutationKey>;

export async function resetPassword(data: ResetPasswordBody) {
  await client<void, ResetPasswordBody>({
    method: 'POST',
    url: '/auth/reset-password',
    data,
  });
}

export function useResetPassword(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        void,
        ResponseErrorConfig<ApiErrorPayload>,
        { data: ResetPasswordBody }
      >,
      'mutationKey' | 'mutationFn'
    >;
  },
) {
  return useMutation<void, ResponseErrorConfig<ApiErrorPayload>, { data: ResetPasswordBody }>({
    mutationKey: resetPasswordMutationKey(),
    mutationFn: ({ data }) => resetPassword(data),
    ...options?.mutation,
  });
}
