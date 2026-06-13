import type { Invitation, InvitationRole } from './member';

export type InviteMemberBody = {
  email: string;
  role: InvitationRole;
};

export type InviteMemberResponse = {
  invitation: Invitation;
  emailSent: boolean;
};
