"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Calendar, MessageSquare, User, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { SubmitResponseDialog } from "@/components/submit-response-dialog"
import { ResponseList } from "@/components/response-list"
import { useReadContract } from "wagmi"
import { BOUNTY_MANAGER_CONTRACT } from "@/lib/contract-config"
import { formatEther } from "viem"

const severityColors = {
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-chart-3 text-foreground",
  medium: "bg-chart-5 text-foreground",
  low: "bg-muted text-muted-foreground",
}

const statusColors = {
  open: "bg-accent text-accent-foreground",
  "in-progress": "bg-chart-2 text-foreground",
  closed: "bg-muted text-muted-foreground",
}

export function BountyDetail({ bountyId }: { bountyId: string }) {
  const [showResponses, setShowResponses] = useState(true)

  // Read bounty data from contract - ALL HOOKS MUST BE AT THE TOP
  const { data: bountyData, isLoading, isError } = useReadContract({
    ...BOUNTY_MANAGER_CONTRACT,
    functionName: 'getBounty',
    args: [BigInt(bountyId)],
  })

  // Read submission count for this bounty - MUST BE BEFORE ANY EARLY RETURNS
  const { data: submissionIds } = useReadContract({
    ...BOUNTY_MANAGER_CONTRACT,
    functionName: 'getBountySubmissions',
    args: [BigInt(bountyId)],
  })

  // Now we can do early returns AFTER all hooks are called
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

  // Parse bounty data from contract
  // getBounty returns: creator, title, description, reward, paymentType, tokenAddress, status, winner, deadline, farcasterCastHash
  const [creator, title, description, reward, paymentType, tokenAddress, statusEnum, winner, deadline, farcasterCastHash] = bountyData as readonly [
    `0x${string}`,
    string,
    string,
    bigint,
    number,
    `0x${string}`,
    number,
    `0x${string}`,
    bigint,
    string
  ]

  const submissionIdArray = submissionIds as readonly bigint[] | undefined
  const submissionCount = submissionIdArray?.length || 0
  const rewardEth = formatEther(reward)
  const deadlineDate = new Date(Number(deadline) * 1000).toLocaleDateString()
  const status = Number(statusEnum) === 0 ? 'open' : Number(statusEnum) === 1 ? 'in-progress' : 'closed'

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
              <Badge className={severityColors.high}>
                <AlertCircle className="mr-1 h-3 w-3" />
                BOUNTY
              </Badge>
              <Badge variant="outline" className={statusColors[status as keyof typeof statusColors]}>
                {status}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Reward</p>
              <p className="text-2xl font-bold text-accent">{rewardEth} ETH</p>
            </div>
          </div>

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
            {farcasterCastHash && (
              <div>
                <h4 className="font-semibold mb-2">Farcaster Cast</h4>
                <code className="text-sm bg-muted px-2 py-1 rounded break-all">{farcasterCastHash}</code>
              </div>
            )}
          </div>

          <Separator />

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
