/**
 * Farcaster Action: Create Bounty
 * Allows users to create bounties directly from any cast using Farcaster Actions
 * Route: POST /api/actions/create-bounty
 * 
 * Installation:
 * Users can add this action via: https://bug-bounty-mini-app.vercel.app/api/actions/create-bounty
 */

import { NextRequest, NextResponse } from 'next/server'
import { parseBountyFromCast, formatBountyConfirmation, formatBountyError } from '@/lib/bounty-parser'
import { createPublicClient, createWalletClient, http, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'
import { bountyManagerAbi } from '@/lib/contracts'

const BOUNTY_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_BOUNTY_MANAGER_ADDRESS as `0x${string}`

/**
 * GET - Return action metadata
 */
export async function GET(req: NextRequest) {
  const actionMetadata = {
    name: 'Create Bounty',
    icon: 'bug',
    description: 'Turn any cast into a bug bounty. Mention reward and severity in your cast.',
    aboutUrl: `${process.env.NEXT_PUBLIC_URL}`,
    action: {
      type: 'post',
    },
  }

  return NextResponse.json(actionMetadata)
}

/**
 * POST - Handle action execution
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Farcaster Action payload
    const {
      untrustedData,
      trustedData,
    } = body

    const castHash = untrustedData?.castId?.hash
    const fid = untrustedData?.fid
    const castText = untrustedData?.castText || ''
    const address = untrustedData?.address

    console.log('🎬 Action triggered:', { fid, castHash, castText })

    if (!castText) {
      return NextResponse.json({
        message: '❌ No cast text found. Please use this action on a cast describing the bounty.',
      })
    }

    // Parse bounty from cast
    const parsedBounty = parseBountyFromCast(castText)

    if (!parsedBounty.isValid) {
      return NextResponse.json({
        message: formatBountyError(parsedBounty.errors),
      })
    }

    // Create bounty on-chain
    try {
      const txHash = await createBountyOnChain(
        parsedBounty,
        address || '0x0000000000000000000000000000000000000000'
      )

      return NextResponse.json({
        message: formatBountyConfirmation(parsedBounty, txHash),
      })
    } catch (error: any) {
      console.error('Error creating bounty:', error)
      
      return NextResponse.json({
        message: `❌ Failed to create bounty: ${error.message}\n\nEnsure the bot wallet has sufficient ETH.`,
      })
    }
  } catch (error: any) {
    console.error('Action error:', error)
    return NextResponse.json({
      message: `❌ Action failed: ${error.message}`,
    })
  }
}

/**
 * Create bounty on Base blockchain
 */
async function createBountyOnChain(
  bounty: { title: string; description: string; reward: string; severity: string },
  creatorAddress: string
): Promise<string> {
  if (!BOUNTY_MANAGER_ADDRESS) {
    throw new Error('BOUNTY_MANAGER_ADDRESS not configured')
  }

  const botPrivateKey = process.env.BOT_PRIVATE_KEY
  if (!botPrivateKey) {
    throw new Error('BOT_PRIVATE_KEY not configured')
  }

  const account = privateKeyToAccount(botPrivateKey as `0x${string}`)
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
  })

  const publicClient = createPublicClient({
    chain: base,
    transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
  })

  const severityMap: Record<string, number> = {
    low: 0,
    medium: 1,
    high: 2,
    critical: 3,
  }

  const rewardWei = parseEther(bounty.reward)

  const { request } = await publicClient.simulateContract({
    address: BOUNTY_MANAGER_ADDRESS,
    abi: bountyManagerAbi,
    functionName: 'createBounty',
    args: [
      bounty.title,
      bounty.description,
      severityMap[bounty.severity.toLowerCase()] || 1,
      creatorAddress as `0x${string}`,
    ],
    account,
    value: rewardWei,
  })

  const hash = await walletClient.writeContract(request)
  return hash
}
