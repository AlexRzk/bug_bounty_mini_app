import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { AlertCircle, Calendar, MessageSquare, User } from "lucide-react"
import Link from "next/link"

interface Bounty {
  id: string
  title: string
  description: string
  reward: string
  severity: string
  status: string
  submittedBy: string
  deadline: string
  responses: number
}

interface BountyCardProps {
  bounty: Bounty
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

export function BountyCard({ bounty }: BountyCardProps) {
  return (
    <Card className="flex flex-col transition-all hover:shadow-lg">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Badge className={severityColors[bounty.severity as keyof typeof severityColors]}>
            <AlertCircle className="mr-1 h-3 w-3" />
            {bounty.severity.toUpperCase()}
          </Badge>
          <Badge variant="outline" className={statusColors[bounty.status as keyof typeof statusColors]}>
            {bounty.status}
          </Badge>
        </div>
        <h3 className="text-balance text-lg font-semibold leading-tight text-card-foreground">{bounty.title}</h3>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <p className="text-pretty text-sm text-muted-foreground line-clamp-3">{bounty.description}</p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">by</span>
            <span className="font-mono text-foreground">{bounty.submittedBy}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Deadline:</span>
            <span className="text-foreground">{bounty.deadline}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">{bounty.responses} responses</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border pt-4">
        <div>
          <p className="text-xs text-muted-foreground">Reward</p>
          <p className="text-xl font-bold text-accent">{bounty.reward}</p>
        </div>
        <Link href={`/bounty/${bounty.id}`}>
          <Button size="sm">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
