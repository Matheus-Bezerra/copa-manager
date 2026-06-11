export type ChampionshipRole = 'OWNER' | 'ADMINISTRATOR' | 'ORGANIZER';

export type InvitationRole = 'ADMINISTRATOR' | 'ORGANIZER';

export type MemberUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

export type Member = {
  id: string;
  championshipId: string;
  userId: string;
  role: ChampionshipRole;
  createdAt: string;
  user: MemberUser;
};

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED';

export type Invitation = {
  id: string;
  championshipId: string;
  email: string;
  role: ChampionshipRole;
  token: string;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
  inviteUrl: string;
};

export type MemberWithoutUser = Omit<Member, 'user'>;
