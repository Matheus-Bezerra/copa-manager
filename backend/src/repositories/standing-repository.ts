export interface Standing {
  id: string
  championshipId: string
  stageId: string
  groupId: string
  teamId: string
  position: number
  points: number
  wins: number
  draws: number
  losses: number
  goalsScored: number
  goalsConceded: number
  goalDifference: number
  updatedAt: Date
}

export interface UpsertStandingInput {
  id: string
  championshipId: string
  stageId: string
  groupId: string
  teamId: string
  position?: number
  points?: number
  wins?: number
  draws?: number
  losses?: number
  goalsScored?: number
  goalsConceded?: number
  goalDifference?: number
}

export interface StandingRepository {
  findByGroupId(groupId: string): Promise<Standing[]>
  findByStageAndGroup(stageId: string, groupId: string): Promise<Standing[]>
  findByTeamAndGroup(teamId: string, groupId: string): Promise<Standing | null>
  upsert(data: UpsertStandingInput): Promise<Standing>
  deleteByGroupId(groupId: string): Promise<void>
}
