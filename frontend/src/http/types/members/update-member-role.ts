import type { InvitationRole, MemberWithoutUser } from './member';

export type UpdateMemberRoleBody = {
  role: InvitationRole;
};

export type UpdateMemberRoleResponse = {
  member: MemberWithoutUser;
};
