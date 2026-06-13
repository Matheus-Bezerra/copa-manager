export interface MatchTimerState {
  startedAt: Date | null
  pausedAt: Date | null
  accumulatedPausedMs: number
}

export function computeMatchElapsedSeconds(
  match: MatchTimerState,
  nowMs: number = Date.now(),
): number {
  if (!match.startedAt) {
    return 0
  }

  const startedMs = match.startedAt.getTime()
  const endMs = match.pausedAt ? match.pausedAt.getTime() : nowMs
  const elapsedMs = endMs - startedMs - match.accumulatedPausedMs

  return Math.max(0, Math.floor(elapsedMs / 1000))
}

export function isMatchTimerPaused(match: MatchTimerState): boolean {
  return match.pausedAt !== null
}
