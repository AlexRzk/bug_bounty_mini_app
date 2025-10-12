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

// Mock data
const mockBounty = {
  id: "1",
  title: "Critical Smart Contract Vulnerability",
  description:
    "Find and report critical vulnerabilities in our DeFi protocol smart contracts deployed on Base testnet. We are looking for issues related to reentrancy, access control, oracle manipulation, and any other critical security concerns. Please provide detailed reproduction steps and potential fixes.",
  reward: "5.0 ETH",
  severity: "critical",
  status: "open",
  submittedBy: "defi-protocol.eth",
  deadline: "2025-02-15",
  responses: 3,
  contractAddress: "0x1234...5678",
  scope: "Smart Contracts, DeFi Protocol",
}

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
              <Badge className={severityColors[mockBounty.severity as keyof typeof severityColors]}>
                <AlertCircle className="mr-1 h-3 w-3" />
                {mockBounty.severity.toUpperCase()}
              </Badge>
              <Badge variant="outline" className={statusColors[mockBounty.status as keyof typeof statusColors]}>
                {mockBounty.status}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Reward</p>
              <p className="text-2xl font-bold text-accent">{mockBounty.reward}</p>
            </div>
          </div>

          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground">{mockBounty.title}</h1>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">by</span>
              <span className="font-mono text-foreground">{mockBounty.submittedBy}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Deadline:</span>
              <span className="text-foreground">{mockBounty.deadline}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{mockBounty.responses} responses</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-pretty text-muted-foreground leading-relaxed">{mockBounty.description}</p>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Contract Address</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded">{mockBounty.contractAddress}</code>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Scope</h4>
              <p className="text-sm text-muted-foreground">{mockBounty.scope}</p>
            </div>
          </div>

          <Separator />

          <div className="flex justify-end">
            <SubmitResponseDialog bountyId={bountyId} />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Responses ({mockBounty.responses})</h2>
          <Button variant="outline" size="sm" onClick={() => setShowResponses(!showResponses)}>
            {showResponses ? "Hide" : "Show"} Responses
          </Button>
        </div>

        {showResponses && <ResponseList bountyId={bountyId} />}
      </div>
    </div>
  )
}
