export type AppError = {
  code: string;
  message: string;
  statusCode: number;
};

export const errorMessage = {
  emailAlreadyInUse: {
    code: 'AUTH/EMAIL_ALREADY_IN_USE',
    message: 'Email is already in use',
    statusCode: 409,
  },
  invalidCredentials: {
    code: 'AUTH/INVALID_CREDENTIALS',
    message: 'Invalid credentials',
    statusCode: 401,
  },
  invalidRefreshToken: {
    code: 'AUTH/INVALID_REFRESH_TOKEN',
    message: 'Invalid refresh token',
    statusCode: 401,
  },
  userBlocked: {
    code: 'AUTH/USER_BLOCKED',
    message: 'User account is blocked',
    statusCode: 403,
  },
  unauthorized: {
    code: 'AUTH/UNAUTHORIZED',
    message: 'Unauthorized',
    statusCode: 401,
  },
  invalidCurrentPassword: {
    code: 'AUTH/INVALID_CURRENT_PASSWORD',
    message: 'Invalid current password',
    statusCode: 401,
  },
  samePassword: {
    code: 'AUTH/SAME_PASSWORD',
    message: 'New password must be different from the current password',
    statusCode: 400,
  },
  invalidResetCode: {
    code: 'AUTH/INVALID_RESET_CODE',
    message: 'Invalid or expired reset code',
    statusCode: 400,
  },
  noLocalPassword: {
    code: 'AUTH/NO_LOCAL_PASSWORD',
    message: 'User has no local password',
    statusCode: 400,
  },
  userNotFound: {
    code: 'AUTH/USER_NOT_FOUND',
    message: 'User not found',
    statusCode: 404,
  },
  validationFieldError: {
    code: 'VALIDATION/FIELD_ERROR',
    message: 'Validation error',
    statusCode: 400,
  },
  serializationError: {
    code: 'RESPONSE/SERIALIZATION_ERROR',
    message: 'Response serialization error',
    statusCode: 500,
  },
  internalServerError: {
    code: 'RESPONSE/INTERNAL_SERVER_ERROR',
    message: 'Internal server error',
    statusCode: 500,
  },
} as const satisfies Record<string, AppError>;
