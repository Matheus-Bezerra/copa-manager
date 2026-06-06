export interface Team {
  id: string;
  championshipId: string;
  name: string;
  shortName: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTeamInput {
  id: string;
  championshipId: string;
  name: string;
  shortName?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
}

export interface UpdateTeamInput {
  name?: string;
  shortName?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
}

export interface TeamRepository {
  findById(id: string): Promise<Team | null>;
  findByChampionshipId(championshipId: string): Promise<Team[]>;
  findByChampionshipIdAndName(championshipId: string, name: string): Promise<Team | null>;
  create(data: CreateTeamInput): Promise<Team>;
  update(id: string, data: UpdateTeamInput): Promise<Team>;
  delete(id: string): Promise<void>;
}
