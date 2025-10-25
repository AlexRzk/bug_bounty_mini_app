"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, CheckCircle, ExternalLink } from "lucide-react"
import { useReadContract, useWriteContract, useAccount, usePublicClient, useWaitForTransactionReceipt } from "wagmi"
import { BOUNTY_MANAGER_CONTRACT } from "@/lib/contract-config"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

const statusColors = {
  pending: "bg-chart-2 text-foreground",
  accepted: "bg-accent text-accent-foreground",
  rejected: "bg-muted text-muted-foreground",
}

// Helper to extract GitHub URLs from text
function extractGitHubUrls(text: string): string[] {
  const githubUrlPattern = /https?:\/\/(www\.)?github\.com\/[^\s)]+/gi
  const matches = text.match(githubUrlPattern)
  return matches ? [...new Set(matches)] : []
}

export function ResponseList({ bountyId }: { bountyId: string }) {
  const { address } = useAccount()
  const { writeContract, data: hash } = useWriteContract()
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const publicClient = usePublicClient()
  const { toast } = useToast()
  const [responses, setResponses] = useState<Array<readonly [
    bigint,
    bigint,
    `0x${string}`,
    string,
    bigint,
    boolean
  ]>>([])
  const [responsesLoading, setResponsesLoading] = useState(false)

  // Wait for transaction confirmation
  const { isSuccess: isAcceptSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Show success toast when acceptance is confirmed
  useEffect(() => {
    if (isAcceptSuccess && hash) {
      toast({
        title: "✅ Response Accepted!",
        description: "The bounty has been completed and payment sent to the winner.",
      })
      setAcceptingId(null)
    }
  }, [isAcceptSuccess, hash, toast])

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

  // V3 Bounty struct: [id, creator, title, description, reward, severity, status, feeCollector, totalFees, boostedAmount, lockedAt, selectionDeadline, selectedResponseId]
  const [
    ,
    creator,
    ,
    ,
    ,
    ,
    statusEnum,
  ] = bountyData as readonly [
    bigint,           // 0: id
    `0x${string}`,    // 1: creator
    string,           // 2: title
    string,           // 3: description
    bigint,           // 4: reward
    number,           // 5: severity
    number,           // 6: status
    `0x${string}`,    // 7: feeCollector
    bigint,           // 8: totalFees
    bigint,           // 9: boostedAmount
    bigint,           // 10: lockedAt
    bigint,           // 11: selectionDeadline
    bigint,           // 12: selectedResponseId
  ]
  const isCreator = address?.toLowerCase() === creator.toLowerCase()
  const isActive = Number(statusEnum) === 0 // Status 0 = Active, 1 = Locked (can still accept)
  const canAccept = Number(statusEnum) === 0 || Number(statusEnum) === 1 // Active or Locked

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
    
    console.log('=== ACCEPT SUBMISSION DEBUG ===')
    console.log('Bounty ID:', bountyId)
    console.log('Response ID:', submissionId.toString())
    console.log('Contract:', BOUNTY_MANAGER_CONTRACT.address)
    console.log('Creator:', creator)
    console.log('Current User:', address)
    
    setAcceptingId(submissionId.toString())
    try {
      await writeContract({
        ...BOUNTY_MANAGER_CONTRACT,
        functionName: 'completeBounty',  // V3 uses completeBounty instead of acceptSubmission
        args: [BigInt(bountyId), submissionId],  // V3 needs both bountyId and responseId
      })
      console.log('✅ Transaction submitted')
    } catch (error) {
      console.error('❌ Failed to accept submission:', error)
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
            canAccept={canAccept}
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
  canAccept,
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
  canAccept: boolean
  onAccept: () => void
  isAccepting: boolean
}) {
  const [, , submitter, description, submittedAt, accepted] = submission

  const submittedDate = new Date(Number(submittedAt) * 1000).toLocaleDateString()
  const status = accepted ? 'accepted' : 'pending'
  
  // Extract GitHub URLs from description
  const githubUrls = extractGitHubUrls(description)

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
        
        {/* GitHub Resolution Links */}
        {githubUrls.length > 0 && (
          <div className="bg-muted/50 border border-border rounded-lg p-3">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              {accepted ? 'Resolution Links' : 'Referenced Links'}
            </h4>
            <div className="space-y-1">
              {githubUrls.map((url, index) => (
                <Link
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 break-all"
                >
                  <span>🔗</span>
                  <span>{url}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-end gap-2">
          {isCreator && !accepted && canAccept && (
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
