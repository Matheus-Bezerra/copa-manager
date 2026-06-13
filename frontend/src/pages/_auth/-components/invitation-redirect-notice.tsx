import { isInvitationAcceptRedirect } from '@/utils/invitation-redirect';

type InvitationRedirectNoticeProps = {
  redirect?: string;
};

export function InvitationRedirectNotice({ redirect }: InvitationRedirectNoticeProps) {
  if (!isInvitationAcceptRedirect(redirect)) {
    return null;
  }

  return (
    <p className="rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-center text-sm text-muted-foreground">
      Você foi convidado para um campeonato. Use o mesmo e-mail do convite ao entrar ou criar
      conta.
    </p>
  );
}
