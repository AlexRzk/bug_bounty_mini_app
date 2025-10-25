"use client"

import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Zap, Users, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold tracking-tight">
              Security.<br />Simplified.
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find bugs. Earn rewards. Build reputation. All onchain.
            </p>
          </div>

          {/* Alpha Notice & Roadmap */}
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2 text-amber-600 dark:text-amber-400">
                Alpha Version - Building the Future
              </h2>
              <p className="text-muted-foreground">
                More features coming soon
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20">
                      <span className="text-2xl">🏆</span>
                    </div>
                    <CardTitle className="text-lg">NFT Badges</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Collectible achievement NFTs for top contributors and milestones
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
                      <span className="text-2xl">🔍</span>
                    </div>
                    <CardTitle className="text-lg">Vulnerability Scanner</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    AI-powered smart contract analysis using Solidity Scan API
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
                      <span className="text-2xl">🚀</span>
                    </div>
                    <CardTitle className="text-lg">Bounty Boosting</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Increase rewards dynamically to attract more security hunters
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/20">
                      <span className="text-2xl">💼</span>
                    </div>
                    <CardTitle className="text-lg">Recruiter System</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Direct messaging to hire top-ranked security experts
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Pain Points - 3 Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
                    <Shield className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
                <CardTitle className="text-lg">No Trust Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Smart contracts hold funds. Automatic payouts. No middleman. No disputes.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20">
                    <TrendingUp className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
                <CardTitle className="text-lg">Build Your Reputation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Every action is onchain. Prove your skills. Climb the leaderboard.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                    <Zap className="h-6 w-6 text-green-500" />
                  </div>
                </div>
                <CardTitle className="text-lg">Fast & Transparent</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Submit responses instantly. Track everything onchain. Get paid immediately.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold text-primary">1</div>
                  <h3 className="font-semibold">Post or Find</h3>
                  <p className="text-sm text-muted-foreground">
                    Create a bounty for your contract or find one to hunt
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold text-primary">2</div>
                  <h3 className="font-semibold">Submit Solution</h3>
                  <p className="text-sm text-muted-foreground">
                    Find the bug, submit your findings onchain
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold text-primary">3</div>
                  <h3 className="font-semibold">Get Rewarded</h3>
                  <p className="text-sm text-muted-foreground">
                    Winner selected, funds released automatically
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Built on Base */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-semibold">Built on Base</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Fast transactions. Low fees. Basenames support. Onchain reputation. Everything you need.
                </p>
                <div className="flex gap-4 justify-center text-sm text-muted-foreground pt-2">
                  <span>🏷️ Basenames</span>
                  <span>⚡ Instant</span>
                  <span>💎 Transparent</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center space-y-6 pt-4">
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/">
                <Button size="lg" className="text-base px-8">
                  Start Hunting
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button size="lg" variant="outline" className="text-base px-8">
                  View Leaderboard
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              Built by AlexRzk • Base Batches Initiative
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
