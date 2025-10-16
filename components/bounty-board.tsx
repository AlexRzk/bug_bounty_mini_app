"use client"

import { useState } from "react"
import { useReadContract } from "wagmi"
import { formatEther } from "viem"
import { BountyCard } from "@/components/bounty-card"
import { BountyFilters } from "@/components/bounty-filters"
import { SubmitBountyDialog } from "@/components/submit-bounty-dialog"
import { BOUNTY_MANAGER_CONTRACT } from "@/lib/contract-config"

export function BountyBoard() {
  const [filter, setFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("reward")

  // Read the total number of bounties from the contract
  const { data: nextBountyId, isLoading } = useReadContract({
    ...BOUNTY_MANAGER_CONTRACT,
    functionName: "nextBountyId",
  })

  // Read individual bounties (for now, read up to first 10)
  const maxBounties = nextBountyId ? Math.min(Number(nextBountyId) - 1, 50) : 0
  
  const bounty1 = useReadContract({
    ...BOUNTY_MANAGER_CONTRACT,
    functionName: "getBounty",
    args: [1n],
    query: { enabled: maxBounties >= 1 },
  })
  const bounty2 = useReadContract({
    ...BOUNTY_MANAGER_CONTRACT,
    functionName: "getBounty",
    args: [2n],
    query: { enabled: maxBounties >= 2 },
  })
  const bounty3 = useReadContract({
    ...BOUNTY_MANAGER_CONTRACT,
    functionName: "getBounty",
    args: [3n],
    query: { enabled: maxBounties >= 3 },
  })
  const bounty4 = useReadContract({
    ...BOUNTY_MANAGER_CONTRACT,
    functionName: "getBounty",
    args: [4n],
    query: { enabled: maxBounties >= 4 },
  })
  const bounty5 = useReadContract({
    ...BOUNTY_MANAGER_CONTRACT,
    functionName: "getBounty",
    args: [5n],
    query: { enabled: maxBounties >= 5 },
  })

  // Transform contract data to UI format
  const bountyData = [bounty1, bounty2, bounty3, bounty4, bounty5]
  
  const bounties = bountyData
    .map((query, index) => {
      if (!query.data) return null
      
      const [creator, title, description, reward, paymentType, tokenAddress, status, winner, deadline, farcasterCastHash] = query.data as readonly [
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
      
      // Skip cancelled bounties (status === 2)
      if (Number(status) === 2) return null
      
      // Map contract status enum to UI status
      const statusMap: Record<number, string> = {
        0: "open",        // Active
        1: "in-progress", // Completed (has winner)
      }
      
      return {
        id: (index + 1).toString(),
        title: title || "Untitled Bounty",
        description: description || "No description",
        reward: `${formatEther(reward)} ${paymentType === 0 ? 'ETH' : 'ERC20'}`,
        severity: "high", // You can add severity logic based on reward size
        status: statusMap[Number(status)] || "open",
        submittedBy: creator?.slice(0, 6) + "..." + creator?.slice(-4),
        deadline: new Date(Number(deadline) * 1000).toISOString().split('T')[0],
        responses: 0, // You can fetch this via getBountySubmissions if needed
      }
    })
    .filter((bounty): bounty is NonNullable<typeof bounty> => bounty !== null)

  const filteredBounties = bounties.filter((bounty) => {
    if (filter === "all") return true
    if (filter === "critical") return bounty.severity === "critical"
    if (filter === "high") return bounty.severity === "high"
    if (filter === "low") return bounty.severity === "low"
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground">Active Bug Bounties</h2>
          <p className="text-pretty text-muted-foreground mt-1">
            Discover security vulnerabilities and earn rewards on Base Sepolia
          </p>
        </div>
        <SubmitBountyDialog />
      </div>

      <BountyFilters currentFilter={filter} onFilterChange={setFilter} currentSort={sortBy} onSortChange={setSortBy} />

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading bounties from blockchain...</p>
        </div>
      ) : filteredBounties.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-2">No bounties found on-chain yet.</p>
          <p className="text-sm text-muted-foreground">
            Be the first to create a bounty! Total bounties: {nextBountyId ? Number(nextBountyId) - 1 : 0}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBounties.map((bounty) => bounty && (
            <BountyCard key={bounty.id} bounty={bounty} />
          ))}
        </div>
      )}
    </div>
  )
}
