import type { Match } from '@/repositories/match-repository'
import type { MatchEventRepository } from '@/repositories/match-event-repository'
import type { PlayerRepository } from '@/repositories/player-repository'
import type { PlayerStatisticsRepository } from '@/repositories/player-statistics-repository'

export async function incrementMatchesPlayedOnMatchFinished(
  match: Match,
  matchEventRepository: MatchEventRepository,
  playerRepository: PlayerRepository,
  playerStatisticsRepository: PlayerStatisticsRepository,
): Promise<void> {
  if (!match.homeTeamId || !match.awayTeamId) {
    return
  }

  const events = await matchEventRepository.findByMatchId(match.id)
  const playersWithEvents = new Set(
    events
      .map((event) => event.playerId)
      .filter((playerId): playerId is string => playerId !== null),
  )

  const players = await playerRepository.findByTeamIds([match.homeTeamId, match.awayTeamId])

  await Promise.all(
    players
      .filter((player) => !playersWithEvents.has(player.id))
      .map((player) =>
        playerStatisticsRepository.increment(player.id, { matchesPlayed: 1 }),
      ),
  )
}
