"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Calendar, MessageSquare, User, ArrowLeft, Clock, Lock, Shield } from "lucide-react"
import Link from "next/link"
import { SubmitResponseDialog } from "@/components/submit-response-dialog"
import { ResponseList } from "@/components/response-list"
import { useReadContract, useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { BOUNTY_MANAGER_CONTRACT } from "@/lib/contract-config"
import { formatEther } from "viem"
import { 
  BountyStatusV3, 
  getBountyStatusText, 
  getBountyStatusColor,
  formatTimeRemaining,
  canDisputeBounty,
  calculateCompensationPerResponder
} from "@/lib/bounty-v3-utils"
import { toast } from "@/hooks/use-toast"

const severityColors = {
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-chart-3 text-foreground",
  medium: "bg-chart-5 text-foreground",
  low: "bg-muted text-muted-foreground",
}

export function BountyDetail({ bountyId }: { bountyId: string }) {
  const [showResponses, setShowResponses] = useState(true)

  // Read bounty data from contract
  const { data: bountyData, isLoading, isError, refetch } = useReadContract({
    ...BOUNTY_MANAGER_CONTRACT,
    functionName: 'bounties',
    args: [BigInt(bountyId)],
  })

  // Read submission count
  const { data: submissionIds } = useReadContract({
    ...BOUNTY_MANAGER_CONTRACT,
    functionName: 'getBountyResponses',
    args: [BigInt(bountyId)],
  })

  const { address } = useAccount()
  
  // V3 features - Dispute and compensation
  const { data: canDispute } = useReadContract({
    ...BOUNTY_MANAGER_CONTRACT,
    functionName: 'canDisputeBounty',
    args: [BigInt(bountyId)],
  })

  const { data: hasClaimedCompensation } = useReadContract({
    ...BOUNTY_MANAGER_CONTRACT,
    functionName: 'hasClaimedCompensation',
    args: address ? [BigInt(bountyId), address] : undefined,
  })

  // Write functions
  const { writeContract: disputeBounty, data: disputeHash, isPending: isDisputing } = useWriteContract()
  const { writeContract: claimCompensation, data: claimHash, isPending: isClaiming } = useWriteContract()

  // Wait for dispute transaction
  const { isLoading: isDisputeConfirming } = useWaitForTransactionReceipt({
    hash: disputeHash,
  })

  // Wait for claim transaction
  const { isLoading: isClaimConfirming } = useWaitForTransactionReceipt({
    hash: claimHash,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading bounty...</p>
        </div>
      </div>
    )
  }

  if (isError || !bountyData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Bounty not found or failed to load.</p>
        <Link href="/">
          <Button variant="outline" className="mt-4">
            Back to Board
          </Button>
        </Link>
      </div>
    )
  }

  // Parse bounty data (V3 includes lockedAt and selectionDeadline)
  const [
    id,
    creator,
    title,
    description,
    reward,
    severityEnum,
    statusEnum,
    winner,
    createdAt,
    deadline,
    responseCount,
    lockedAt,
    selectionDeadline,
  ] = bountyData as readonly [
    bigint,
    `0x${string}`,
    string,
    string,
    bigint,
    number,
    number,
    `0x${string}`,
    bigint,
    bigint,
    bigint,
    bigint,
    bigint,
  ]

  const submissionIdArray = submissionIds as readonly bigint[] | undefined
  const submissionCount = submissionIdArray?.length ?? Number(responseCount ?? 0n)
  const rewardEth = formatEther(reward)
  const deadlineDate = new Date(Number(deadline) * 1000).toLocaleDateString()

  const status = Number(statusEnum) as BountyStatusV3
  const statusText = getBountyStatusText(status)
  const statusColor = getBountyStatusColor(status)

  const severityMap: Record<number, string> = {
    0: 'low',
    1: 'medium',
    2: 'high',
    3: 'critical',
  }
  const severity = severityMap[Number(severityEnum)] || 'low'
  
  const isCreator = address?.toLowerCase() === creator.toLowerCase()
  const isLocked = status === BountyStatusV3.Locked
  const isDisputed = status === BountyStatusV3.Disputed
  const canTriggerDispute = Boolean(canDispute)
  const hasAlreadyClaimed = Boolean(hasClaimedCompensation)

  const handleDispute = async () => {
    try {
      disputeBounty({
        ...BOUNTY_MANAGER_CONTRACT,
        functionName: 'disputeBounty',
        args: [BigInt(bountyId)],
      })
      toast({
        title: "Dispute Triggered",
        description: "Bounty has been marked as disputed. Responders can now claim compensation.",
      })
      refetch()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to trigger dispute. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleClaimCompensation = async () => {
    try {
      claimCompensation({
        ...BOUNTY_MANAGER_CONTRACT,
        functionName: 'claimCompensation',
        args: [BigInt(bountyId)],
      })
      toast({
        title: "Compensation Claimed",
        description: "Your compensation has been sent to your wallet.",
      })
      refetch()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to claim compensation. Please try again.",
        variant: "destructive",
      })
    }
  }

  const compensationPerResponder = calculateCompensationPerResponder(reward, responseCount)

  return (
    <div className="space-y-6">
      <div>
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Board
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge className={severityColors[severity as keyof typeof severityColors]}>
                <AlertCircle className="mr-1 h-3 w-3" />
                {severity.toUpperCase()}
              </Badge>
              <Badge variant="outline" className={statusColor}>
                {isLocked && <Lock className="mr-1 h-3 w-3" />}
                {statusText}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Reward</p>
              <p className="text-2xl font-bold text-accent">{rewardEth} ETH</p>
            </div>
          </div>

          {/* V3: Lock Status Alert */}
          {isLocked && selectionDeadline > 0n && (
            <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex gap-3">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-orange-900 dark:text-orange-100">🔒 Bounty Locked</p>
                  <p className="text-sm text-orange-800 dark:text-orange-200">
                    Creator must select a winner within: <strong>{formatTimeRemaining(selectionDeadline)}</strong>
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                    Bounty cannot be cancelled after responses are submitted.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* V3: Dispute Status */}
          {isDisputed && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex gap-3">
                <Shield className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-900 dark:text-red-100">⚠️ Bounty Disputed</p>
                  <p className="text-sm text-red-800 dark:text-red-200 mb-2">
                    Creator failed to select a winner. Responders can claim compensation.
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300">
                    Compensation: <strong>{formatEther(compensationPerResponder)} ETH</strong> per responder
                  </p>
                </div>
              </div>
            </div>
          )}

          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground">{title}</h1>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">by</span>
              <span className="font-mono text-foreground">
                {creator.slice(0, 6)}...{creator.slice(-4)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Deadline:</span>
              <span className="text-foreground">{deadlineDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{submissionCount.toString()} responses</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-pretty text-muted-foreground leading-relaxed whitespace-pre-wrap">{description}</p>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Contract Address</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded break-all">{BOUNTY_MANAGER_CONTRACT.address}</code>
            </div>
          </div>

          <Separator />

          {/* V3: Dispute & Compensation Actions */}
          {canTriggerDispute && !isDisputed && (
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-amber-900 dark:text-amber-100">Selection Deadline Passed</p>
                  <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                    The creator hasn't selected a winner. Anyone can trigger a dispute.
                  </p>
                </div>
                <Button
                  onClick={handleDispute}
                  disabled={isDisputing || isDisputeConfirming}
                  variant="destructive"
                  size="sm"
                >
                  {isDisputing || isDisputeConfirming ? "Processing..." : "Trigger Dispute"}
                </Button>
              </div>
            </div>
          )}

          {isDisputed && !hasAlreadyClaimed && !isCreator && (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-green-900 dark:text-green-100">Claim Your Compensation</p>
                  <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                    You can claim {formatEther(compensationPerResponder)} ETH as compensation.
                  </p>
                </div>
                <Button
                  onClick={handleClaimCompensation}
                  disabled={isClaiming || isClaimConfirming}
                  variant="default"
                  size="sm"
                >
                  {isClaiming || isClaimConfirming ? "Processing..." : "Claim Compensation"}
                </Button>
              </div>
            </div>
          )}

          {hasAlreadyClaimed && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                ✅ You have already claimed your compensation.
              </p>
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-blue-900 dark:text-blue-100">🔒 Secure & Protected</p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Submissions are private until accepted. After the first response, the bounty locks for 7 days - preventing creator abuse. If no winner is selected, responders receive automatic compensation.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <SubmitResponseDialog bountyId={bountyId} />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Responses ({submissionCount.toString()})</h2>
          <Button variant="outline" size="sm" onClick={() => setShowResponses(!showResponses)}>
            {showResponses ? "Hide" : "Show"} Responses
          </Button>
        </div>

        {showResponses && <ResponseList bountyId={bountyId} />}
      </div>
    </div>
  )
}
