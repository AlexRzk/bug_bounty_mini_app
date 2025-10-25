// Reputation system types and utilities
export interface ReputationScore {
  address: string
  basename?: string
  totalPoints: number
  bountiesCreated: number
  responsesSubmitted: number
  bountiesWon: number
  bountiesResolved: number
  level: ReputationLevel
  rank?: number
}

export enum ReputationLevel {
  NEWCOMER = "Newcomer",
  HUNTER = "Hunter",
  EXPERT = "Expert",
  MASTER = "Master",
  LEGEND = "Legend"
}

export const REPUTATION_POINTS = {
  CREATE_BOUNTY: 10,
  SUBMIT_RESPONSE: 1,
  WIN_BOUNTY: 20,
  RESOLVE_BOUNTY: 0,
} as const

export const LEVEL_THRESHOLDS = {
  [ReputationLevel.NEWCOMER]: 0,
  [ReputationLevel.HUNTER]: 50,
  [ReputationLevel.EXPERT]: 200,
  [ReputationLevel.MASTER]: 500,
  [ReputationLevel.LEGEND]: 1000,
} as const

export function calculateReputationLevel(points: number): ReputationLevel {
  if (points >= LEVEL_THRESHOLDS[ReputationLevel.LEGEND]) return ReputationLevel.LEGEND
  if (points >= LEVEL_THRESHOLDS[ReputationLevel.MASTER]) return ReputationLevel.MASTER
  if (points >= LEVEL_THRESHOLDS[ReputationLevel.EXPERT]) return ReputationLevel.EXPERT
  if (points >= LEVEL_THRESHOLDS[ReputationLevel.HUNTER]) return ReputationLevel.HUNTER
  return ReputationLevel.NEWCOMER
}

export function calculateTotalPoints(stats: {
  bountiesCreated: number
  responsesSubmitted: number
  bountiesWon: number
  bountiesResolved: number
}): number {
  return (
    stats.bountiesCreated * REPUTATION_POINTS.CREATE_BOUNTY +
    stats.responsesSubmitted * REPUTATION_POINTS.SUBMIT_RESPONSE +
    stats.bountiesWon * REPUTATION_POINTS.WIN_BOUNTY +
    stats.bountiesResolved * REPUTATION_POINTS.RESOLVE_BOUNTY
  )
}

export function getLevelColor(level: ReputationLevel): string {
  switch (level) {
    case ReputationLevel.LEGEND:
      return "text-yellow-500"
    case ReputationLevel.MASTER:
      return "text-purple-500"
    case ReputationLevel.EXPERT:
      return "text-blue-500"
    case ReputationLevel.HUNTER:
      return "text-green-500"
    case ReputationLevel.NEWCOMER:
      return "text-gray-500"
  }
}

export function getLevelIcon(level: ReputationLevel): string {
  switch (level) {
    case ReputationLevel.LEGEND:
      return "👑"
    case ReputationLevel.MASTER:
      return "💎"
    case ReputationLevel.EXPERT:
      return "⭐"
    case ReputationLevel.HUNTER:
      return "🎯"
    case ReputationLevel.NEWCOMER:
      return "🔰"
  }
}
