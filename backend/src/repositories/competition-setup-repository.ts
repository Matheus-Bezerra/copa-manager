import type { BracketLinkOutcome, BracketLinkSlot } from './match-bracket-link-repository'
import type { StageFormat, StageType } from './stage-repository'

export interface GroupSetupData {
  id: string
  name: string
  displayOrder: number
}

export interface RoundSetupData {
  id: string
  number: number
  name?: string | null
}

export interface MatchSetupData {
  id: string
  roundId: string
}

export interface BracketLinkSetupData {
  id: string
  fromMatchId: string
  toMatchId: string
  outcome: BracketLinkOutcome
  toSlot: BracketLinkSlot
}

export interface StageSetupData {
  id: string
  name: string
  type: StageType
  format?: StageFormat | null
  teamsToAdvance: number
  qualifiedTeams?: number | null
  thirdPlaceMatch: boolean
  displayOrder: number
  groups: GroupSetupData[]
  rounds: RoundSetupData[]
  matches: MatchSetupData[]
  bracketLinks: BracketLinkSetupData[]
}

export interface SetupStagesInput {
  championshipId: string
  stages: StageSetupData[]
}

export interface SetupStageResult {
  id: string
  championshipId: string
  name: string
  type: StageType
  format: StageFormat | null
  teamsToAdvance: number
  qualifiedTeams: number | null
  thirdPlaceMatch: boolean
  displayOrder: number
  createdAt: Date
  groups: GroupSetupResult[]
  rounds: RoundSetupResult[]
}

export interface GroupSetupResult {
  id: string
  stageId: string
  name: string
  displayOrder: number
  createdAt: Date
}

export interface RoundSetupResult {
  id: string
  stageId: string
  number: number
  name: string | null
  createdAt: Date
}

export interface CompetitionSetupRepository {
  setup(data: SetupStagesInput): Promise<SetupStageResult[]>
}
