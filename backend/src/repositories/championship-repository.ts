import type { ChampionshipRole, ChampionshipStatus } from '@prisma/client';

export interface Championship {
  id: string;
  ownerUserId: string;
  name: string;
  slug: string;
  description: string | null;
  regulations: string | null;
  startDate: Date;
  endDate: Date;
  status: ChampionshipStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateChampionshipInput {
  id: string;
  ownerUserId: string;
  name: string;
  slug: string;
  description?: string | null;
  regulations?: string | null;
  startDate: Date;
  endDate: Date;
}

export interface UpdateChampionshipInput {
  name?: string;
  slug?: string;
  description?: string | null;
  regulations?: string | null;
  startDate?: Date;
  endDate?: Date;
  status?: ChampionshipStatus;
}

export interface ChampionshipRepository {
  findById(id: string): Promise<Championship | null>;
  findBySlug(slug: string): Promise<Championship | null>;
  findByUserId(userId: string): Promise<Championship[]>;
  slugExists(slug: string): Promise<boolean>;
  create(data: CreateChampionshipInput): Promise<Championship>;
  update(id: string, data: UpdateChampionshipInput): Promise<Championship>;
  delete(id: string): Promise<void>;
}

export interface PublicChampionship {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  status: ChampionshipStatus;
}

export function toPublicChampionship(championship: Championship): PublicChampionship {
  return {
    id: championship.id,
    name: championship.name,
    slug: championship.slug,
    description: championship.description,
    startDate: championship.startDate,
    endDate: championship.endDate,
    status: championship.status,
  };
}

export const MANAGE_CHAMPIONSHIP_ROLES: ChampionshipRole[] = ['OWNER', 'ADMINISTRATOR'];
export const MANAGE_TEAMS_PLAYERS_ROLES: ChampionshipRole[] = [
  'OWNER',
  'ADMINISTRATOR',
  'ORGANIZER',
];
