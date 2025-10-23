"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, CheckCircle } from "lucide-react"
import { useReadContract, useWriteContract, useAccount, usePublicClient } from "wagmi"
import { BOUNTY_MANAGER_CONTRACT } from "@/lib/contract-config"
import { useEffect, useState } from "react"

const statusColors = {
  pending: "bg-chart-2 text-foreground",
  accepted: "bg-accent text-accent-foreground",
  rejected: "bg-muted text-muted-foreground",
}

export function ResponseList({ bountyId }: { bountyId: string }) {
  const { address } = useAccount()
  const { writeContract } = useWriteContract()
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const publicClient = usePublicClient()
  const [responses, setResponses] = useState<Array<readonly [
    bigint,
    bigint,
    `0x${string}`,
    string,
    bigint,
    boolean
  ]>>([])
  const [responsesLoading, setResponsesLoading] = useState(false)

  // Read bounty to get creator
  const { data: bountyData } = useReadContract({
    ...BOUNTY_MANAGER_CONTRACT,
    functionName: 'bounties',
    args: [BigInt(bountyId)],
  })

  // Read submission IDs for this bounty
  const { data: submissionIds } = useReadContract({
    ...BOUNTY_MANAGER_CONTRACT,
    functionName: 'getBountyResponses',
    args: [BigInt(bountyId)],
  })

  if (!bountyData) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">Loading submissions...</p>
      </div>
    )
  }

  const [
    ,
    creator,
    ,
    ,
    ,
    ,
    statusEnum,
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
  ]
  const isCreator = address?.toLowerCase() === creator.toLowerCase()
  const isActive = Number(statusEnum) === 0

  const submissionIdArray = submissionIds as readonly bigint[] | undefined

  useEffect(() => {
    if (!publicClient || !submissionIdArray || submissionIdArray.length === 0) {
      setResponses([])
      return
    }

    let cancelled = false
    setResponsesLoading(true)

    Promise.all(
      submissionIdArray.map((id) =>
        publicClient.readContract({
          ...BOUNTY_MANAGER_CONTRACT,
          functionName: 'responses',
          args: [id],
        })
      )
    )
      .then((result) => {
        if (!cancelled) {
          setResponses(result as typeof responses)
        }
      })
      .catch((err) => {
        console.error('Failed to load responses', err)
        if (!cancelled) {
          setResponses([])
        }
      })
      .finally(() => {
        if (!cancelled) {
          setResponsesLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [publicClient, submissionIdArray])

  if (!submissionIdArray || submissionIdArray.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
        <p className="text-muted-foreground">No submissions yet. Be the first to submit a report!</p>
      </div>
    )
  }

  // Security: Only show submissions to bounty creator or accepted submissions to others
  if (!isCreator) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
        <div className="space-y-2">
          <p className="font-semibold text-foreground">🔒 Submissions are Private</p>
          <p className="text-sm text-muted-foreground">
            Only the bounty creator can view submission details before acceptance.
          </p>
          <p className="text-sm text-muted-foreground">
            This protects researchers from having their vulnerabilities publicly exploited.
          </p>
        </div>
      </div>
    )
  }

  const handleAcceptSubmission = async (submissionId: bigint) => {
    if (!isCreator) return
    
    setAcceptingId(submissionId.toString())
    try {
      await writeContract({
        ...BOUNTY_MANAGER_CONTRACT,
        functionName: 'acceptSubmission',
        args: [submissionId],
      })
    } catch (error) {
      console.error('Failed to accept submission:', error)
    } finally {
      setAcceptingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {responsesLoading && responses.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-sm text-muted-foreground">Loading submissions...</p>
          </CardContent>
        </Card>
      ) : (
        responses.map((response) => (
          <SubmissionCard
            key={response[0].toString()}
            submission={response}
            isCreator={isCreator}
            isActive={isActive}
            onAccept={() => handleAcceptSubmission(response[0])}
            isAccepting={acceptingId === response[0].toString()}
          />
        ))
      )}
    </div>
  )
}

function SubmissionCard({
  submission,
  isCreator,
  isActive,
  onAccept,
  isAccepting,
}: {
  submission: readonly [
    bigint,
    bigint,
    `0x${string}`,
    string,
    bigint,
    boolean
  ]
  isCreator: boolean
  isActive: boolean
  onAccept: () => void
  isAccepting: boolean
}) {
  const [, , submitter, description, submittedAt, accepted] = submission

  const submittedDate = new Date(Number(submittedAt) * 1000).toLocaleDateString()
  const status = accepted ? 'accepted' : 'pending'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-sm">
              {submitter.slice(0, 6)}...{submitter.slice(-4)}
            </span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">{submittedDate}</span>
          </div>
          <Badge variant="outline" className={statusColors[status]}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Report</h4>
          <p className="text-pretty text-foreground whitespace-pre-wrap">{description}</p>
        </div>
        <div className="flex items-center justify-end gap-2">
          {isCreator && !accepted && isActive && (
            <Button
              onClick={onAccept}
              disabled={isAccepting}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              {isAccepting ? 'Accepting...' : 'Accept Submission'}
            </Button>
          )}
          {accepted && (
            <Badge variant="outline" className="bg-accent text-accent-foreground">
              ✓ Accepted & Paid
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
