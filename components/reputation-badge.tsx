"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ReputationScore, getLevelColor, getLevelIcon, REPUTATION_POINTS } from "@/lib/reputation"
import { Trophy, Target, CheckCircle, FileCheck } from "lucide-react"
import { formatAddressOrBasename } from "@/hooks/use-basename"

interface ReputationBadgeProps {
  reputation: ReputationScore
  basename?: string | null
  compact?: boolean
}

export function ReputationBadge({ reputation, basename, compact = false }: ReputationBadgeProps) {
  if (compact) {
    return (
      <Badge variant="secondary" className={`${getLevelColor(reputation.level)} font-semibold`}>
        {getLevelIcon(reputation.level)} {reputation.level} • {reputation.totalPoints} pts
      </Badge>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-card to-muted/20">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">
                {formatAddressOrBasename(reputation.address, basename)}
              </h3>
              <p className="text-sm text-muted-foreground">{reputation.address}</p>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${getLevelColor(reputation.level)}`}>
                {getLevelIcon(reputation.level)}
              </div>
              <div className={`text-sm font-semibold ${getLevelColor(reputation.level)}`}>
                {reputation.level}
              </div>
            </div>
          </div>

          {/* Total Points */}
          <div className="text-center py-4 bg-primary/10 rounded-lg">
            <div className="text-3xl font-bold text-primary">{reputation.totalPoints}</div>
            <div className="text-sm text-muted-foreground">Total Reputation Points</div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
              <FileCheck className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-sm font-semibold">{reputation.bountiesCreated}</div>
                <div className="text-xs text-muted-foreground">Bounties Created</div>
                <div className="text-xs text-green-500">
                  +{reputation.bountiesCreated * REPUTATION_POINTS.CREATE_BOUNTY} pts
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
              <Target className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-sm font-semibold">{reputation.responsesSubmitted}</div>
                <div className="text-xs text-muted-foreground">Responses</div>
                <div className="text-xs text-green-500">
                  +{reputation.responsesSubmitted * REPUTATION_POINTS.SUBMIT_RESPONSE} pts
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-sm font-semibold">{reputation.bountiesWon}</div>
                <div className="text-xs text-muted-foreground">Bounties Won</div>
                <div className="text-xs text-green-500">
                  +{reputation.bountiesWon * REPUTATION_POINTS.WIN_BOUNTY} pts
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-sm font-semibold">{reputation.bountiesResolved}</div>
                <div className="text-xs text-muted-foreground">Resolved</div>
                <div className="text-xs text-green-500">
                  +{reputation.bountiesResolved * REPUTATION_POINTS.RESOLVE_BOUNTY} pts
                </div>
              </div>
            </div>
          </div>

          {reputation.rank && (
            <div className="text-center pt-2 border-t">
              <span className="text-sm text-muted-foreground">
                Global Rank: <span className="font-bold text-primary">#{reputation.rank}</span>
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
