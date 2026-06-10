import { createElement } from 'react';
import { render } from '@react-email/render';
import { Resend } from 'resend';
import { env } from '@/config/env';
import { getEmailInlineAttachments } from '@/emails/email-inline-assets';
import InvitationEmail from '@/emails/invitation-email';
import PasswordResetEmail from '@/emails/password-reset-email';
import type {
  EmailService,
  SendInvitationEmailInput,
  SendPasswordResetEmailInput,
} from './email-service';

export class ResendEmailService implements EmailService {
  private readonly resend = new Resend(env.RESEND_API_KEY);

  async sendPasswordResetEmail(input: SendPasswordResetEmailInput): Promise<void> {
    const html = await render(
      createElement(PasswordResetEmail, {
        userName: input.name,
        code: input.code,
        expiresInMinutes: env.PASSWORD_RESET_EXPIRES_MINUTES,
      })
    );

    const { error } = await this.resend.emails.send({
      from: env.RESEND_FROM,
      to: input.to,
      subject: 'Redefinição de senha — Copa Manager',
      html,
      attachments: getEmailInlineAttachments(),
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async sendInvitationEmail(input: SendInvitationEmailInput): Promise<void> {
    const html = await render(
      createElement(InvitationEmail, {
        championshipName: input.championshipName,
        role: input.role,
        inviteUrl: input.inviteUrl,
        expiresAt: input.expiresAt,
      })
    );

    const { error } = await this.resend.emails.send({
      from: env.RESEND_FROM,
      to: input.to,
      subject: 'Convite para o campeonato — Copa Manager',
      html,
      attachments: getEmailInlineAttachments(),
    });

    if (error) {
      throw new Error(error.message);
    }
  }
}
