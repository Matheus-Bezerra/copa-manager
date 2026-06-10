import type { GroupRepository } from '@/repositories/group-repository'
import type { MatchRepository } from '@/repositories/match-repository'
import type { RoundRepository } from '@/repositories/round-repository'
import type { Stage, StageRepository } from '@/repositories/stage-repository'
import type { StandingRepository } from '@/repositories/standing-repository'
import { revertBracketCascade } from '@/services/competition/revert-bracket-cascade'
import type { MatchBracketLinkRepository } from '@/repositories/match-bracket-link-repository'

function findNextKnockoutStage(stages: Stage[], currentStage: Stage): Stage | null {
  return (
    stages
      .filter(
        (stage) => stage.displayOrder > currentStage.displayOrder && stage.type === 'KNOCKOUT',
      )
      .sort((a, b) => a.displayOrder - b.displayOrder)[0] ?? null
  )
}

async function clearFirstRoundKnockoutSlots(
  knockoutStageId: string,
  matchRepository: MatchRepository,
  roundRepository: RoundRepository,
  bracketLinkRepository: MatchBracketLinkRepository,
): Promise<void> {
  const firstRound = await roundRepository.findByStageIdAndNumber(knockoutStageId, 1)

  if (!firstRound) {
    return
  }

  const matches = await matchRepository.findByRoundId(firstRound.id)

  for (const match of matches) {
    await revertBracketCascade(match.id, matchRepository, bracketLinkRepository)
    await matchRepository.update(match.id, { homeTeamId: null, awayTeamId: null })
  }
}

function isGroupStageComplete(matches: Awaited<ReturnType<MatchRepository['findByStageId']>>): boolean {
  const activeMatches = matches.filter((match) => match.status !== 'CANCELLED')

  if (activeMatches.length === 0) {
    return false
  }

  return activeMatches.every((match) => match.status === 'FINISHED')
}

export async function advanceGroupStageClassified(
  championshipId: string,
  groupStage: Stage,
  stageRepository: StageRepository,
  groupRepository: GroupRepository,
  standingRepository: StandingRepository,
  roundRepository: RoundRepository,
  matchRepository: MatchRepository,
  bracketLinkRepository: MatchBracketLinkRepository,
): Promise<void> {
  const stages = await stageRepository.findByChampionshipId(championshipId)
  const nextKnockout = findNextKnockoutStage(stages, groupStage)

  if (!nextKnockout) {
    return
  }

  const stageMatches = await matchRepository.findByStageId(groupStage.id)

  if (!isGroupStageComplete(stageMatches)) {
    await clearFirstRoundKnockoutSlots(
      nextKnockout.id,
      matchRepository,
      roundRepository,
      bracketLinkRepository,
    )
    return
  }

  const groups = await groupRepository.findByStageId(groupStage.id)
  const classifiedTeams: string[] = []

  for (const group of groups) {
    const standings = await standingRepository.findByStageAndGroup(groupStage.id, group.id)

    const topTeams = standings
      .sort((a, b) => a.position - b.position)
      .slice(0, groupStage.teamsToAdvance)
      .map((standing) => standing.teamId)

    classifiedTeams.push(...topTeams)
  }

  const firstRound = await roundRepository.findByStageIdAndNumber(nextKnockout.id, 1)

  if (!firstRound) {
    return
  }

  await clearFirstRoundKnockoutSlots(
    nextKnockout.id,
    matchRepository,
    roundRepository,
    bracketLinkRepository,
  )

  const firstRoundMatches = await matchRepository.findByRoundId(firstRound.id)

  for (let i = 0; i < firstRoundMatches.length; i++) {
    const match = firstRoundMatches[i]

    await matchRepository.update(match.id, {
      homeTeamId: classifiedTeams[i * 2] ?? null,
      awayTeamId: classifiedTeams[i * 2 + 1] ?? null,
    })
  }
}
