import type { Member } from './member';

export type AcceptInvitationBody = {
  token: string;
};

export type AcceptInvitationResponse = {
  member: Member;
};
