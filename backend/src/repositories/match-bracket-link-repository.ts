export type BracketLinkOutcome = 'WINNER' | 'LOSER'
export type BracketLinkSlot = 'HOME' | 'AWAY'

export interface MatchBracketLink {
  id: string
  fromMatchId: string
  toMatchId: string
  outcome: BracketLinkOutcome
  toSlot: BracketLinkSlot
  createdAt: Date
}

export interface CreateMatchBracketLinkInput {
  id: string
  fromMatchId: string
  toMatchId: string
  outcome: BracketLinkOutcome
  toSlot: BracketLinkSlot
}

export interface MatchBracketLinkRepository {
  findById(id: string): Promise<MatchBracketLink | null>
  findByFromMatchId(fromMatchId: string): Promise<MatchBracketLink[]>
  findByToMatchId(toMatchId: string): Promise<MatchBracketLink[]>
  create(data: CreateMatchBracketLinkInput): Promise<MatchBracketLink>
  delete(id: string): Promise<void>
}
