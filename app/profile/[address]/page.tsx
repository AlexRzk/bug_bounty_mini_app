"use client"

import { use } from "react"
import { Header } from "@/components/header"
import { ReputationBadge } from "@/components/reputation-badge"
import { useReputation } from "@/hooks/use-reputation"
import { useBasename } from "@/hooks/use-basename"
import { Address } from "viem"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ProfilePage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params)
  const { reputation, isLoading } = useReputation(address as Address)
  const { basename } = useBasename(address as Address)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">User Profile</h1>
            <Link href="/leaderboard">
              <Button variant="outline">View Leaderboard</Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
            </div>
          ) : reputation ? (
            <ReputationBadge reputation={reputation} basename={basename} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  No Activity Found
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This address hasn't created or participated in any bounties yet.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
