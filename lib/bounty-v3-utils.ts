/**
 * BountyManagerV3 Types and Utilities
 * Handles escrow, time locks, and dispute resolution
 */

export enum BountyStatusV3 {
  Active = 0,
  Locked = 1,     // NEW: Locked after first response
  Completed = 2,
  Cancelled = 3,
  Disputed = 4,   // NEW: In dispute resolution
}

export interface BountyDataV3 {
  id: bigint
  creator: string
  title: string
  description: string
  reward: bigint
  severity: number
  status: BountyStatusV3
  winner: string
  createdAt: bigint
  deadline: bigint
  responseCount: bigint
  lockedAt: bigint           // NEW
  selectionDeadline: bigint  // NEW
}

export const SELECTION_PERIOD = 7 * 24 * 60 * 60 // 7 days in seconds
export const DISPUTE_COMPENSATION_PERCENT = 10 // 10%

/**
 * Get human-readable status text
 */
export function getBountyStatusText(status: BountyStatusV3): string {
  switch (status) {
    case BountyStatusV3.Active:
      return 'Active'
    case BountyStatusV3.Locked:
      return 'Locked'
    case BountyStatusV3.Completed:
      return 'Completed'
    case BountyStatusV3.Cancelled:
      return 'Cancelled'
    case BountyStatusV3.Disputed:
      return 'Disputed'
    default:
      return 'Unknown'
  }
}

/**
 * Get status color for UI
 */
export function getBountyStatusColor(status: BountyStatusV3): string {
  switch (status) {
    case BountyStatusV3.Active:
      return 'bg-green-500/10 text-green-500 border-green-500/20'
    case BountyStatusV3.Locked:
      return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    case BountyStatusV3.Completed:
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    case BountyStatusV3.Cancelled:
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    case BountyStatusV3.Disputed:
      return 'bg-red-500/10 text-red-500 border-red-500/20'
    default:
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
  }
}

/**
 * Calculate time remaining until selection deadline
 */
export function getSelectionTimeRemaining(selectionDeadline: bigint): {
  days: number
  hours: number
  minutes: number
  isExpired: boolean
} {
  const now = Math.floor(Date.now() / 1000)
  const deadline = Number(selectionDeadline)
  const remaining = deadline - now

  if (remaining <= 0) {
    return { days: 0, hours: 0, minutes: 0, isExpired: true }
  }

  const days = Math.floor(remaining / (24 * 60 * 60))
  const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((remaining % (60 * 60)) / 60)

  return { days, hours, minutes, isExpired: false }
}

/**
 * Format time remaining as human-readable string
 */
export function formatTimeRemaining(selectionDeadline: bigint): string {
  const { days, hours, minutes, isExpired } = getSelectionTimeRemaining(selectionDeadline)
  
  if (isExpired) {
    return 'Expired'
  }

  if (days > 0) {
    return `${days}d ${hours}h remaining`
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`
  }
  return `${minutes}m remaining`
}

/**
 * Check if bounty can be disputed
 */
export function canDisputeBounty(bounty: BountyDataV3): boolean {
  const now = Math.floor(Date.now() / 1000)
  return (
    bounty.status === BountyStatusV3.Locked &&
    Number(bounty.selectionDeadline) < now &&
    bounty.responseCount > 0n
  )
}

/**
 * Calculate compensation per responder
 */
export function calculateCompensationPerResponder(
  reward: bigint,
  responseCount: bigint
): bigint {
  const totalCompensation = (reward * BigInt(DISPUTE_COMPENSATION_PERCENT)) / 100n
  return responseCount > 0n ? totalCompensation / responseCount : 0n
}
