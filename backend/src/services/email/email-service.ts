export interface SendPasswordResetEmailInput {
  to: string;
  name: string;
  code: string;
}

export interface SendInvitationEmailInput {
  to: string;
  championshipName: string;
  role: string;
  inviteUrl: string;
  expiresAt: Date;
}

export interface EmailService {
  sendPasswordResetEmail(input: SendPasswordResetEmailInput): Promise<void>;
  sendInvitationEmail(input: SendInvitationEmailInput): Promise<void>;
}
