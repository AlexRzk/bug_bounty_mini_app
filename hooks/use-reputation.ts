"use client"

import { useEffect, useState } from "react"
import { usePublicClient } from "wagmi"
import { Address } from "viem"
import { BOUNTY_MANAGER_CONTRACT } from "@/lib/contract-config"
import { 
  ReputationScore, 
  calculateReputationLevel, 
  calculateTotalPoints,
  ReputationLevel 
} from "@/lib/reputation"

export function useReputation(address?: Address) {
  const publicClient = usePublicClient()
  const [reputation, setReputation] = useState<ReputationScore | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!address || !publicClient) {
      setIsLoading(false)
      return
    }

    const fetchReputation = async () => {
      try {
        setIsLoading(true)

        const nextBountyId = await publicClient.readContract({
          address: BOUNTY_MANAGER_CONTRACT.address as Address,
          abi: BOUNTY_MANAGER_CONTRACT.abi,
          functionName: "nextBountyId",
        }) as bigint

        const lowercaseAddress = address.toLowerCase()

        let bountiesCreated = 0
        let responsesSubmitted = 0
        let bountiesWon = 0
        let bountiesResolved = 0

        // Iterate through all bounties to calculate reputation from on-chain data
        for (let bountyId = 1n; bountyId < nextBountyId; bountyId++) {
          try {
            const bountyData = await publicClient.readContract({
              address: BOUNTY_MANAGER_CONTRACT.address as Address,
              abi: BOUNTY_MANAGER_CONTRACT.abi,
              functionName: "bounties",
              args: [bountyId],
            }) as any

            // Bounty returns tuple: [id, creator, title, description, reward, severity, status, winner, createdAt, deadline, responseCount]
            if (!bountyData || !Array.isArray(bountyData) || bountyData.length < 11) {
              continue
            }

            const [id, creator, title, description, reward, severity, status, winner, createdAt, deadline, responseCount] = bountyData

            if (!creator) {
              continue
            }

            const creatorAddress = typeof creator === "string" ? creator.toLowerCase() : ""
            const winnerAddress = typeof winner === "string" ? winner.toLowerCase() : ""
            const respCount = Number(responseCount ?? 0)

            if (creatorAddress === lowercaseAddress) {
              bountiesCreated++
              if (Number(status ?? 0) === 1) {
                bountiesResolved++
              }
            }

            if (winnerAddress === lowercaseAddress) {
              bountiesWon++
            }

            if (respCount > 0) {
              try {
                const responseIds = await publicClient.readContract({
                  address: BOUNTY_MANAGER_CONTRACT.address as Address,
                  abi: BOUNTY_MANAGER_CONTRACT.abi,
                  functionName: "getBountyResponses",
                  args: [bountyId],
                }) as bigint[]

                for (const responseId of responseIds) {
                  try {
                    const response = await publicClient.readContract({
                      address: BOUNTY_MANAGER_CONTRACT.address as Address,
                      abi: BOUNTY_MANAGER_CONTRACT.abi,
                      functionName: "responses",
                      args: [responseId],
                    }) as any

                    const responderAddress = typeof response?.responder === "string" ? response.responder.toLowerCase() : ""
                    if (responderAddress === lowercaseAddress) {
                      responsesSubmitted++
                    }
                  } catch (responseError) {
                    console.log("Error fetching response", responseId.toString(), responseError)
                  }
                }
              } catch (responsesError) {
                console.log("Error fetching responses for bounty", bountyId.toString(), responsesError)
              }
            }
          } catch (err) {
            console.log(`Error fetching bounty ${bountyId.toString()}:`, err)
          }
        }

        const totalPoints = calculateTotalPoints({
          bountiesCreated,
          responsesSubmitted,
          bountiesWon,
          bountiesResolved,
        })

        const level = calculateReputationLevel(totalPoints)

        setReputation({
          address,
          totalPoints,
          bountiesCreated,
          responsesSubmitted,
          bountiesWon,
          bountiesResolved,
          level,
        })
      } catch (error) {
        console.error("Error fetching reputation:", error)
        // Set default reputation on error
        setReputation({
          address,
          totalPoints: 0,
          bountiesCreated: 0,
          responsesSubmitted: 0,
          bountiesWon: 0,
          bountiesResolved: 0,
          level: ReputationLevel.NEWCOMER,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchReputation()
  }, [address, publicClient])

  return { reputation, isLoading }
}
