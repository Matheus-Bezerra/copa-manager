export function isInvitationAcceptRedirect(redirect?: string) {
  return redirect?.startsWith('/invitations/accept') ?? false;
}

export function buildInvitationAcceptRedirect(token: string) {
  return `/invitations/accept?token=${encodeURIComponent(token)}`;
}

export function followAuthRedirect(redirect?: string) {
  if (redirect?.startsWith('/')) {
    window.location.href = redirect;
    return true;
  }

  return false;
}
