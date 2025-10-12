"use client"

import { useState } from "react"
import { BountyCard } from "@/components/bounty-card"
import { BountyFilters } from "@/components/bounty-filters"
import { SubmitBountyDialog } from "@/components/submit-bounty-dialog"

// Mock data for demonstration
const mockBounties = [
  {
    id: "1",
    title: "Critical Smart Contract Vulnerability",
    description:
      "Find and report critical vulnerabilities in our DeFi protocol smart contracts deployed on Base testnet.",
    reward: "5.0 ETH",
    severity: "critical",
    status: "open",
    submittedBy: "defi-protocol.eth",
    deadline: "2025-02-15",
    responses: 3,
  },
  {
    id: "2",
    title: "Frontend XSS Vulnerability",
    description: "Identify cross-site scripting vulnerabilities in our web application interface.",
    reward: "1.5 ETH",
    severity: "high",
    status: "open",
    submittedBy: "web3-app.eth",
    deadline: "2025-02-10",
    responses: 7,
  },
  {
    id: "3",
    title: "API Authentication Bypass",
    description: "Test our API endpoints for authentication and authorization vulnerabilities.",
    reward: "2.0 ETH",
    severity: "high",
    status: "open",
    submittedBy: "api-team.eth",
    deadline: "2025-02-20",
    responses: 2,
  },
  {
    id: "4",
    title: "Gas Optimization Opportunities",
    description: "Suggest gas optimization improvements for our NFT minting contract.",
    reward: "0.5 ETH",
    severity: "low",
    status: "open",
    submittedBy: "nft-project.eth",
    deadline: "2025-02-25",
    responses: 12,
  },
  {
    id: "5",
    title: "Reentrancy Attack Vector",
    description: "Identify potential reentrancy vulnerabilities in our staking contract.",
    reward: "3.0 ETH",
    severity: "critical",
    status: "in-progress",
    submittedBy: "staking-dao.eth",
    deadline: "2025-02-12",
    responses: 5,
  },
  {
    id: "6",
    title: "Oracle Manipulation Risk",
    description: "Test our price oracle integration for manipulation vulnerabilities.",
    reward: "2.5 ETH",
    severity: "high",
    status: "open",
    submittedBy: "oracle-protocol.eth",
    deadline: "2025-02-18",
    responses: 1,
  },
]

export function BountyBoard() {
  const [filter, setFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("reward")

  const filteredBounties = mockBounties.filter((bounty) => {
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
            Discover security vulnerabilities and earn rewards on Base testnet
          </p>
        </div>
        <SubmitBountyDialog />
      </div>

      <BountyFilters currentFilter={filter} onFilterChange={setFilter} currentSort={sortBy} onSortChange={setSortBy} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredBounties.map((bounty) => (
          <BountyCard key={bounty.id} bounty={bounty} />
        ))}
      </div>
    </div>
  )
}
