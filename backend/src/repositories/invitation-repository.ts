import type { ChampionshipRole, InvitationStatus } from '@prisma/client';

export interface Invitation {
  id: string;
  championshipId: string;
  email: string;
  role: ChampionshipRole;
  token: string;
  status: InvitationStatus;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
}

export interface CreateInvitationInput {
  id: string;
  championshipId: string;
  email: string;
  role: ChampionshipRole;
  token: string;
  expiresAt: Date;
}

export interface InvitationRepository {
  findPendingByChampionshipAndEmail(
    championshipId: string,
    email: string
  ): Promise<Invitation | null>;
  findByToken(token: string): Promise<Invitation | null>;
  create(data: CreateInvitationInput): Promise<Invitation>;
  markAsExpired(id: string): Promise<Invitation>;
  acceptInvitation(id: string): Promise<Invitation>;
}
