"use client"

import { useAccount } from "wagmi"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Award, TrendingUp, Flame, Calendar, Trophy, Target } from "lucide-react"

// Dashboard component showing user reputation, badges, and activity
export function UserDashboard() {
  const { address, isConnected } = useAccount()

  // TODO: Integrate with ReputationSystem contract once deployed
  // const { data: userStats } = useReadContract({
  //   ...REPUTATION_SYSTEM_CONTRACT,
  //   functionName: 'getUserStats',
  //   args: [address],
  // })

  // Mock data for demonstration (replace with actual contract reads)
  const mockStats = {
    reputationScore: 850,
    submissionsCount: 12,
    acceptedSubmissions: 8,
    totalEarnings: "2.5 ETH",
    consecutiveDays: 5,
    badges: [
      { id: 1, name: "Bug Hunter", earned: true, icon: "🐛" },
      { id: 2, name: "High Earner", earned: true, icon: "💰" },
      { id: 3, name: "Streak Master", earned: false, icon: "🔥" },
      { id: 4, name: "Elite Reporter", earned: false, icon: "⭐" },
    ],
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to view your reputation and activity
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Track your reputation, badges, and activity
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur hover:bg-card/70 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reputation Score
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{mockStats.reputationScore}</div>
            <Progress value={mockStats.reputationScore / 10} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {mockStats.reputationScore < 500 ? "Novice" : mockStats.reputationScore < 800 ? "Expert" : "Elite"} Reporter
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur hover:bg-card/70 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Submissions
            </CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{mockStats.submissionsCount}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {mockStats.acceptedSubmissions} accepted ({Math.round((mockStats.acceptedSubmissions / mockStats.submissionsCount) * 100)}% success)
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur hover:bg-card/70 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earnings
            </CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{mockStats.totalEarnings}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Across {mockStats.acceptedSubmissions} bounties
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur hover:bg-card/70 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Streak
            </CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{mockStats.consecutiveDays} days</div>
            <p className="text-xs text-muted-foreground mt-2">
              Keep it up! 🔥
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="badges" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/50">
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="space-y-4">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Your Badges
              </CardTitle>
              <CardDescription>
                Earn badges by completing bounties and maintaining streaks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {mockStats.badges.map((badge) => (
                  <Card
                    key={badge.id}
                    className={`border transition-all duration-300 ${
                      badge.earned
                        ? "border-primary/50 bg-primary/5 hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/20"
                        : "border-border/30 bg-muted/30 opacity-60"
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{badge.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{badge.name}</h3>
                          {badge.earned ? (
                            <Badge className="mt-1 bg-primary/20 text-primary border-primary/30">
                              Earned
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="mt-1 border-muted-foreground/30">
                              Locked
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest submissions and bounties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock activity items */}
                <div className="flex items-start gap-4 pb-4">
                  <div className="rounded-full bg-green-500/10 p-2">
                    <Trophy className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Submission Accepted</p>
                    <p className="text-xs text-muted-foreground">
                      Your report for "XSS Vulnerability" was accepted
                    </p>
                    <p className="text-xs text-muted-foreground">2 days ago</p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                    +0.5 ETH
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-start gap-4 pb-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">New Submission</p>
                    <p className="text-xs text-muted-foreground">
                      Submitted report for "CSRF Token Bypass"
                    </p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
                  </div>
                  <Badge variant="outline">Pending</Badge>
                </div>
                <Separator />
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-orange-500/10 p-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Streak Milestone</p>
                    <p className="text-xs text-muted-foreground">
                      Reached 5-day submission streak
                    </p>
                    <p className="text-xs text-muted-foreground">5 days ago</p>
                  </div>
                  <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30">
                    🔥
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg">How Reputation Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Reputation Score:</strong> Calculated based on your submission quality, acceptance rate, and earnings. Higher scores unlock exclusive bounties.
          </p>
          <p>
            <strong className="text-foreground">Badges:</strong> Earned by reaching milestones (e.g., 10 submissions, 1 ETH earned, 7-day streak). Badges are NFTs minted on-chain.
          </p>
          <p>
            <strong className="text-foreground">Streaks:</strong> Submit reports daily to maintain your streak. Streaks boost your reputation score and unlock special badges.
          </p>
          <p className="text-xs pt-2 text-muted-foreground/70">
            Note: Reputation data will be pulled from the deployed ReputationSystem smart contract once integrated.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
