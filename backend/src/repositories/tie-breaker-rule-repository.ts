export interface TieBreakerRule {
  id: string
  championshipId: string
  position: number
  criterion: string
}

export interface CreateTieBreakerRuleInput {
  id: string
  championshipId: string
  position: number
  criterion: string
}

export interface TieBreakerRuleRepository {
  findByChampionshipId(championshipId: string): Promise<TieBreakerRule[]>
  create(data: CreateTieBreakerRuleInput): Promise<TieBreakerRule>
  delete(id: string): Promise<void>
  deleteByChampionshipId(championshipId: string): Promise<void>
}
