"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { AlertCircle, Calendar, MessageSquare, User, Zap } from "lucide-react"
import Link from "next/link"
import ElectricBorder from "@/components/ElectricBorder"

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
  const [isBoosted, setIsBoosted] = useState(false)

  const handleBoost = () => {
    setIsBoosted(!isBoosted)
  }

  const cardContent = (
    <Card className="flex flex-col transition-all hover:shadow-lg h-full">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Badge className={severityColors[bounty.severity as keyof typeof severityColors]}>
            <AlertCircle className="mr-1 h-3 w-3" />
            {bounty.severity.toUpperCase()}
          </Badge>
          <div className="flex gap-2">
            <Badge variant="outline" className={statusColors[bounty.status as keyof typeof statusColors]}>
              {bounty.status}
            </Badge>
            {isBoosted && (
              <Badge className="bg-blue-500 text-white border-blue-400">
                <Zap className="mr-1 h-3 w-3" />
                BOOSTED
              </Badge>
            )}
          </div>
        </div>
        <h3 className="text-balance text-lg font-semibold leading-tight text-card-foreground">{bounty.title}</h3>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <p className="text-pretty text-sm text-muted-foreground line-clamp-3">{bounty.description}</p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">by</span>
            <Link href={`/profile/${bounty.submittedBy}`} className="font-mono text-primary hover:underline">
              {bounty.submittedBy}
            </Link>
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

      <CardFooter className="flex flex-col gap-3 border-t border-border pt-4">
        <div className="flex items-center justify-between w-full">
          <div>
            <p className="text-xs text-muted-foreground">Reward</p>
            <p className="text-xl font-bold text-accent">{bounty.reward}</p>
          </div>
          <Link href={`/bounty/${bounty.id}`}>
            <Button size="sm">View Details</Button>
          </Link>
        </div>
        
        {/* Boost Button - Demo Feature */}
        <Button
          onClick={handleBoost}
          variant={isBoosted ? "secondary" : "outline"}
          size="sm"
          className="w-full relative"
        >
          <Zap className="mr-2 h-4 w-4" />
          {isBoosted ? "Boosted!" : "Boost Bounty"}
          <span className="ml-2 text-xs opacity-70">(Demo - Free)</span>
        </Button>
        {!isBoosted && (
          <p className="text-xs text-muted-foreground text-center">
            ⚡ Test feature - Future updates will require ETH payment
          </p>
        )}
      </CardFooter>
    </Card>
  )

  return isBoosted ? (
    <ElectricBorder
      color="#7df9ff"
      speed={1.2}
      chaos={0.5}
      thickness={2}
      style={{ borderRadius: 12 }}
    >
      {cardContent}
    </ElectricBorder>
  ) : (
    cardContent
  )
}
