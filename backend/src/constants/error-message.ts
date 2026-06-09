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
  championshipNotFound: {
    code: 'CHAMPIONSHIP/NOT_FOUND',
    message: 'Championship not found',
    statusCode: 404,
  },
  championshipForbidden: {
    code: 'CHAMPIONSHIP/FORBIDDEN',
    message: 'You do not have permission to perform this action',
    statusCode: 403,
  },
  championshipMemberAlreadyExists: {
    code: 'CHAMPIONSHIP/MEMBER_ALREADY_EXISTS',
    message: 'User is already a member of this championship',
    statusCode: 409,
  },
  championshipCannotModifyOwner: {
    code: 'CHAMPIONSHIP/CANNOT_MODIFY_OWNER',
    message: 'Cannot modify the owner member',
    statusCode: 400,
  },
  championshipInvitationAlreadyPending: {
    code: 'CHAMPIONSHIP/INVITATION_ALREADY_PENDING',
    message: 'An invitation is already pending for this email',
    statusCode: 409,
  },
  championshipInvitationNotFound: {
    code: 'CHAMPIONSHIP/INVITATION_NOT_FOUND',
    message: 'Invitation not found',
    statusCode: 404,
  },
  championshipInvitationInvalid: {
    code: 'CHAMPIONSHIP/INVITATION_INVALID',
    message: 'Invitation is no longer valid',
    statusCode: 422,
  },
  championshipInvitationExpired: {
    code: 'CHAMPIONSHIP/INVITATION_EXPIRED',
    message: 'Invitation has expired',
    statusCode: 422,
  },
  championshipInvitationEmailMismatch: {
    code: 'CHAMPIONSHIP/INVITATION_EMAIL_MISMATCH',
    message: 'Invitation email does not match the authenticated user',
    statusCode: 403,
  },
  championshipMemberNotFound: {
    code: 'CHAMPIONSHIP/MEMBER_NOT_FOUND',
    message: 'Championship member not found',
    statusCode: 404,
  },
  championshipNameAlreadyExists: {
    code: 'CHAMPIONSHIP/NAME_ALREADY_EXISTS',
    message: 'A championship with this name already exists',
    statusCode: 409,
  },
  teamNotFound: {
    code: 'TEAM/NOT_FOUND',
    message: 'Team not found',
    statusCode: 404,
  },
  teamNameAlreadyTaken: {
    code: 'TEAM/NAME_ALREADY_TAKEN',
    message: 'A team with this name already exists in the championship',
    statusCode: 409,
  },
  playerNotFound: {
    code: 'PLAYER/NOT_FOUND',
    message: 'Player not found',
    statusCode: 404,
  },
  stageNotFound: {
    code: 'STAGE/NOT_FOUND',
    message: 'Stage not found',
    statusCode: 404,
  },
  groupNotFound: {
    code: 'GROUP/NOT_FOUND',
    message: 'Group not found',
    statusCode: 404,
  },
  roundNotFound: {
    code: 'ROUND/NOT_FOUND',
    message: 'Round not found',
    statusCode: 404,
  },
  matchNotFound: {
    code: 'MATCH/NOT_FOUND',
    message: 'Match not found',
    statusCode: 404,
  },
  matchResultNotFound: {
    code: 'MATCH/RESULT_NOT_FOUND',
    message: 'Match result not found',
    statusCode: 404,
  },
  matchAlreadyFinished: {
    code: 'MATCH/ALREADY_FINISHED',
    message: 'Match is already finished',
    statusCode: 409,
  },
  matchCancelled: {
    code: 'MATCH/CANCELLED',
    message: 'Match has been cancelled',
    statusCode: 409,
  },
  stageInvalidFormat: {
    code: 'STAGE/INVALID_FORMAT',
    message: 'Stage format is required for GROUP_STAGE and must not be set for KNOCKOUT',
    statusCode: 422,
  },
  stageInvalidQualifiedTeams: {
    code: 'STAGE/INVALID_QUALIFIED_TEAMS',
    message: 'qualifiedTeams must be a power of 2 (e.g. 2, 4, 8, 16)',
    statusCode: 422,
  },
  stageGroupRequired: {
    code: 'STAGE/GROUP_REQUIRED',
    message: 'At least one group is required for GROUP_STAGE',
    statusCode: 422,
  },
  stageDuplicateOrder: {
    code: 'STAGE/DUPLICATE_ORDER',
    message: 'Stage order must be unique within the championship',
    statusCode: 409,
  },
} as const satisfies Record<string, AppError>;
