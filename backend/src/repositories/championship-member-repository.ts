import type { ChampionshipRole } from '@prisma/client';

export interface ChampionshipMember {
  id: string;
  championshipId: string;
  userId: string;
  role: ChampionshipRole;
  createdAt: Date;
}

export interface ChampionshipMemberWithUser extends ChampionshipMember {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}

export interface CreateChampionshipMemberInput {
  id: string;
  championshipId: string;
  userId: string;
  role: ChampionshipRole;
}

export interface ChampionshipMemberRepository {
  findById(id: string): Promise<ChampionshipMember | null>;
  findByChampionshipAndUser(
    championshipId: string,
    userId: string
  ): Promise<ChampionshipMember | null>;
  findByChampionshipId(championshipId: string): Promise<ChampionshipMemberWithUser[]>;
  create(data: CreateChampionshipMemberInput): Promise<ChampionshipMember>;
  updateRole(id: string, role: ChampionshipRole): Promise<ChampionshipMember>;
  delete(id: string): Promise<void>;
}
