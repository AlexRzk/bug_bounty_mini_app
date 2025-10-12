"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, ThumbsUp, ExternalLink } from "lucide-react"

// Mock responses
const mockResponses = [
  {
    id: "1",
    submittedBy: "security-researcher.eth",
    timestamp: "2025-01-10",
    summary: "Found critical reentrancy vulnerability in withdraw function",
    upvotes: 12,
    status: "under-review",
  },
  {
    id: "2",
    submittedBy: "whitehat-hacker.eth",
    timestamp: "2025-01-09",
    summary: "Access control issue allows unauthorized minting",
    upvotes: 8,
    status: "accepted",
  },
  {
    id: "3",
    submittedBy: "audit-team.eth",
    timestamp: "2025-01-08",
    summary: "Integer overflow in reward calculation",
    upvotes: 5,
    status: "under-review",
  },
]

const statusColors = {
  "under-review": "bg-chart-2 text-foreground",
  accepted: "bg-accent text-accent-foreground",
  rejected: "bg-muted text-muted-foreground",
}

export function ResponseList({ bountyId }: { bountyId: string }) {
  return (
    <div className="space-y-4">
      {mockResponses.map((response) => (
        <Card key={response.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-sm">{response.submittedBy}</span>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">{response.timestamp}</span>
              </div>
              <Badge variant="outline" className={statusColors[response.status as keyof typeof statusColors]}>
                {response.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-pretty text-foreground">{response.summary}</p>
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" className="gap-2">
                <ThumbsUp className="h-4 w-4" />
                {response.upvotes}
              </Button>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                View Details
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
