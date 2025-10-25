"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usePublicClient } from "wagmi"
import { Address } from "viem"
import { BOUNTY_MANAGER_CONTRACT } from "@/lib/contract-config"
import {
  ReputationScore, 
  calculateReputationLevel, 
  calculateTotalPoints,
  getLevelColor,
  getLevelIcon,
  LEVEL_THRESHOLDS,
  ReputationLevel
} from "@/lib/reputation"
import { Trophy, TrendingUp, Users } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { formatAddressOrBasename, useBasename } from "@/hooks/use-basename"

interface LeaderboardEntry extends ReputationScore {
  rank: number
}

function LeaderboardRow({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const { basename } = useBasename(entry.address as Address)
  // Consider an address "verified" for badge when it has a resolvable reverse Basename
  const isRealBaseAddress = !!basename

  // Simple colored outline for top 3
  const getBorderClass = () => {
    if (rank === 1) return "border-l-4 border-yellow-500 bg-yellow-500/5" // Gold
    if (rank === 2) return "border-l-4 border-purple-500 bg-purple-500/5" // Purple
    if (rank === 3) return "border-l-4 border-blue-500 bg-blue-500/5" // Blue
    return ""
  }

  const borderClass = getBorderClass()

  return (
    <div className={`flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors ${borderClass}`}>
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
          {rank <= 3 ? (
            <span className="text-2xl">
              {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
            </span>
          ) : (
            <span className="font-bold text-muted-foreground">#{rank}</span>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Link 
              href={`/profile/${entry.address}`}
              className="font-semibold hover:text-primary transition-colors"
            >
              {basename ? basename : formatAddressOrBasename(entry.address, basename)}
            </Link>
            <Badge variant="secondary" className={`${getLevelColor(entry.level)} text-xs`}>
              {getLevelIcon(entry.level)} {entry.level}
            </Badge>
            {isRealBaseAddress && (
              <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-500 border-blue-500/20">
                ⛓️ Real Base Address
              </Badge>
            )}
          </div>
          
          {/* Address display with Basename indicator */}
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs text-muted-foreground font-mono">{entry.address}</p>
            {basename && (
              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-purple-500/10 text-purple-500 border-purple-500/20">
                Has Basename
              </Badge>
            )}
          </div>
          
          {/* Verification Links */}
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href={`/profile/${entry.address}`}
              className="text-xs text-primary hover:text-primary/80 hover:underline flex items-center gap-1 font-medium"
            >
              <span>👤</span>
              <span>View Profile</span>
            </Link>
            <Link
              href={`https://basescan.org/address/${entry.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>🔍</span>
              <span>BaseScan</span>
            </Link>
            <Link
              href={`https://www.base.org/name/${basename || entry.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-500 hover:text-purple-600 hover:underline flex items-center gap-1"
            >
              <span>🔷</span>
              <span>{basename ? 'View Basename' : 'Check for Basename'}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Bounties Won</div>
          <div className="font-bold text-yellow-500">{entry.bountiesWon}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Created</div>
          <div className="font-bold text-blue-500">{entry.bountiesCreated}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Points</div>
          <div className="text-2xl font-bold text-primary">{entry.totalPoints}</div>
        </div>
      </div>
    </div>
  )
}

export default function LeaderboardPage() {
  const publicClient = usePublicClient()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalUsers, setTotalUsers] = useState(0)

  useEffect(() => {
    if (!publicClient) return

    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true)

        const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

        const userStatsMap = new Map<
          string,
          {
            bountiesCreated: number
            responsesSubmitted: number
            bountiesWon: number
            bountiesResolved: number
          }
        >()

        const ensureStats = (rawAddress: string | undefined | null) => {
          if (!rawAddress) return null
          const addr = rawAddress.toLowerCase()
          if (addr === ZERO_ADDRESS) return null
          if (!userStatsMap.has(addr)) {
            userStatsMap.set(addr, {
              bountiesCreated: 0,
              responsesSubmitted: 0,
              bountiesWon: 0,
              bountiesResolved: 0,
            })
          }
          return userStatsMap.get(addr)!
        }

        const nextBountyId = await publicClient.readContract({
          address: BOUNTY_MANAGER_CONTRACT.address,
          abi: BOUNTY_MANAGER_CONTRACT.abi,
          functionName: "nextBountyId",
        }) as bigint

        for (let bountyId = 1n; bountyId < nextBountyId; bountyId++) {
          try {
            const bountyData = await publicClient.readContract({
              address: BOUNTY_MANAGER_CONTRACT.address,
              abi: BOUNTY_MANAGER_CONTRACT.abi,
              functionName: "bounties",
              args: [bountyId],
            }) as any

            // V3 Bounty returns tuple: [id, creator, title, description, reward, severity, status, winner, createdAt, deadline, responseCount, lockedAt, selectionDeadline]
            if (!bountyData || !Array.isArray(bountyData) || bountyData.length < 13) continue

            const [id, creator, title, description, reward, severity, status, winner, createdAt, deadline, responseCount, lockedAt, selectionDeadline] = bountyData

            if (!creator) continue

            const creatorStats = ensureStats(creator)
            if (creatorStats) {
              creatorStats.bountiesCreated += 1
              // V3 Status: 0=Active, 1=Locked, 2=Completed, 3=Cancelled, 4=Disputed
              if (Number(status ?? 0) === 2) { // Completed
                creatorStats.bountiesResolved += 1
              }
            }

            const winnerStats = ensureStats(winner)
            if (winnerStats) {
              winnerStats.bountiesWon += 1
            }

            const respCount = Number(responseCount ?? 0)
            if (respCount > 0) {
              try {
                const responseIds = await publicClient.readContract({
                  address: BOUNTY_MANAGER_CONTRACT.address,
                  abi: BOUNTY_MANAGER_CONTRACT.abi,
                  functionName: "getBountyResponses",
                  args: [bountyId],
                }) as bigint[]

                for (const responseId of responseIds) {
                  try {
                    const response = await publicClient.readContract({
                      address: BOUNTY_MANAGER_CONTRACT.address,
                      abi: BOUNTY_MANAGER_CONTRACT.abi,
                      functionName: "responses",
                      args: [responseId],
                    }) as any

                    // V3 Response tuple: [id, bountyId, responder, description, submittedAt, accepted]
                    if (response && Array.isArray(response) && response.length >= 3) {
                      const responder = response[2] // responder is 3rd field
                      
                      const responderStats = ensureStats(responder)
                      if (responderStats) {
                        responderStats.responsesSubmitted += 1
                      }
                    } else if (response?.responder) {
                      // Fallback for object format
                      const responderStats = ensureStats(response.responder)
                      if (responderStats) {
                        responderStats.responsesSubmitted += 1
                      }
                    }
                  } catch (responseError) {
                    console.warn("Failed to fetch response", responseId.toString(), responseError)
                  }
                }
              } catch (responsesError) {
                console.warn("Failed to fetch responses for bounty", bountyId.toString(), responsesError)
              }
            }
          } catch (bountyError) {
            console.warn("Failed to fetch bounty", bountyId.toString(), bountyError)
          }
        }

        const entries: LeaderboardEntry[] = Array.from(userStatsMap.entries())
          .map(([address, stats]) => {
            const totalPoints = calculateTotalPoints(stats)
            const level = calculateReputationLevel(totalPoints)
            return {
              address,
              totalPoints,
              level,
              rank: 0,
              ...stats,
            }
          })
          .filter((entry) => entry.totalPoints > 0)
          .sort((a, b) => b.totalPoints - a.totalPoints)
          .map((entry, index) => ({ ...entry, rank: index + 1 }))

        setLeaderboard(entries)
        setTotalUsers(entries.length)
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [publicClient])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Hero Section - Compact */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Reputation Leaderboard</h1>
            <p className="text-sm text-muted-foreground">
              Top security researchers on Base blockchain
            </p>
          </div>

          {/* Leaderboard Features - Three Blocks */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20">
                    <span className="text-2xl">🔷</span>
                  </div>
                  <CardTitle className="text-lg">Basename Integration</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Displays .base.eth names when available for verified addresses. Automatic resolution of reverse records for seamless identity.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/20">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <CardTitle className="text-lg">NFT Badges</CardTitle>
                </div>
                <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-500 border-blue-500/20 w-fit">
                  Coming Soon
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Earn unique achievement badges and collectibles for your contributions. Showcase your expertise with on-chain credentials.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
                    <span className="text-2xl">⬆️</span>
                  </div>
                  <CardTitle className="text-lg">Level Requirements</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">🆕 Newcomer</span>
                    <span className="font-medium">0 pts</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">🎯 Hunter</span>
                    <span className="font-medium">50 pts</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">⚡ Expert</span>
                    <span className="font-medium">200 pts</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">👑 Master</span>
                    <span className="font-medium">500 pts</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">✨ Legend</span>
                    <span className="font-medium">1000 pts</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsers}</div>
                <p className="text-xs text-muted-foreground">Active contributors</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {leaderboard[0]?.totalPoints || 0}
                </div>
                <p className="text-xs text-muted-foreground">Reputation points</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Level</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getLevelColor(leaderboard[0]?.level)}`}>
                  {getLevelIcon(leaderboard[0]?.level)} {leaderboard[0]?.level || "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">Highest rank achieved</p>
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard Table */}
          <Card>
            <CardHeader>
              <CardTitle>Top Contributors</CardTitle>
              <CardDescription>
                Rankings derive from on-chain activity recorded in the bounty manager contract.
                Basenames resolve automatically whenever a reverse record is configured.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : leaderboard.length > 0 ? (
                <div className="space-y-2">
                  {leaderboard.map((entry) => (
                    <LeaderboardRow key={entry.address} entry={entry} rank={entry.rank} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No activity yet. Be the first to create or submit to a bounty!
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
