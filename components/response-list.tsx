"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, CheckCircle, ExternalLink } from "lucide-react"
import { useReadContract, useWriteContract, useAccount } from "wagmi"
import { BOUNTY_MANAGER_CONTRACT } from "@/lib/contract-config"
import { useState } from "react"

const statusColors = {
  pending: "bg-chart-2 text-foreground",
  accepted: "bg-accent text-accent-foreground",
  rejected: "bg-muted text-muted-foreground",
}

export function ResponseList({ bountyId }: { bountyId: string }) {
  const { address } = useAccount()
  const { writeContract } = useWriteContract()
  const [acceptingId, setAcceptingId] = useState<string | null>(null)

  // Read bounty to get creator
  const { data: bountyData } = useReadContract({
    ...BOUNTY_MANAGER_CONTRACT,
    functionName: 'getBounty',
    args: [BigInt(bountyId)],
  })

  // Read submission IDs for this bounty
  const { data: submissionIds } = useReadContract({
    ...BOUNTY_MANAGER_CONTRACT,
    functionName: 'getBountySubmissions',
    args: [BigInt(bountyId)],
  })

  if (!bountyData) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">Loading submissions...</p>
      </div>
    )
  }

  const [creator, , , , , , statusEnum] = bountyData as readonly [
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
  const isCreator = address?.toLowerCase() === creator.toLowerCase()
  const isActive = Number(statusEnum) === 0

  const submissionIdArray = submissionIds as readonly bigint[] | undefined
  if (!submissionIdArray || submissionIdArray.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
        <p className="text-muted-foreground">No submissions yet. Be the first to submit a report!</p>
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
      {submissionIdArray.map((submissionId) => (
        <SubmissionCard
          key={submissionId.toString()}
          submissionId={submissionId}
          isCreator={isCreator}
          isActive={isActive}
          onAccept={() => handleAcceptSubmission(submissionId)}
          isAccepting={acceptingId === submissionId.toString()}
        />
      ))}
    </div>
  )
}

function SubmissionCard({
  submissionId,
  isCreator,
  isActive,
  onAccept,
  isAccepting,
}: {
  submissionId: bigint
  isCreator: boolean
  isActive: boolean
  onAccept: () => void
  isAccepting: boolean
}) {
  const { data: submissionData, isLoading } = useReadContract({
    ...BOUNTY_MANAGER_CONTRACT,
    functionName: 'submissions',
    args: [submissionId],
  })

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-sm text-muted-foreground">Loading submission...</p>
        </CardContent>
      </Card>
    )
  }

  if (!submissionData) return null

  // submissions returns: id, bountyId, submitter, description, proofUrl, submittedAt, accepted, farcasterUsername
  const [id, bountyIdFromSubmission, submitter, description, proofUrl, submittedAt, accepted, farcasterUsername] = submissionData as readonly [
    bigint,
    bigint,
    `0x${string}`,
    string,
    string,
    bigint,
    boolean,
    string
  ]

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
        {proofUrl && (
          <div>
            <h4 className="font-semibold mb-2">Evidence</h4>
            <a
              href={proofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              {proofUrl}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
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
