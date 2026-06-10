import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import type { ResponseErrorConfig } from '../../client';
import client from '../../client';
import type { ForgotPasswordBody } from '../../types/auth/forgot-password';
import type { ApiErrorPayload } from '../../types/api-error';

export const forgotPasswordMutationKey = () =>
  [{ url: '/auth/forgot-password' }] as const;

export type ForgotPasswordMutationKey = ReturnType<typeof forgotPasswordMutationKey>;

export async function forgotPassword(data: ForgotPasswordBody) {
  await client<void, ForgotPasswordBody>({
    method: 'POST',
    url: '/auth/forgot-password',
    data,
  });
}

export function useForgotPassword(
  options?: {
    mutation?: Omit<
      UseMutationOptions<
        void,
        ResponseErrorConfig<ApiErrorPayload>,
        { data: ForgotPasswordBody }
      >,
      'mutationKey' | 'mutationFn'
    >;
  },
) {
  return useMutation<void, ResponseErrorConfig<ApiErrorPayload>, { data: ForgotPasswordBody }>({
    mutationKey: forgotPasswordMutationKey(),
    mutationFn: ({ data }) => forgotPassword(data),
    ...options?.mutation,
  });
}
