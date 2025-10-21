/**
 * Farcaster Mention Monitor (Polling-based)
 * Alternative to webhooks for free Neynar tier
 * Route: GET /api/monitor/mentions
 * 
 * Works with just NEYNAR_API_KEY (no FID or Signer needed!)
 * Searches for casts with bounty keywords
 * 
 * Setup with Vercel Cron:
 * - Add to vercel.json: "crons": [{ "path": "/api/monitor/mentions", "schedule": "*/5 * * * *" }]
 * - Runs every 5 minutes to check for new bounty casts
 */

import { NextRequest, NextResponse } from 'next/server'
import { parseBountyFromCast, formatBountyConfirmation, formatBountyError } from '@/lib/bounty-parser'
import { createPublicClient, createWalletClient, http, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'
import { bountyManagerAbi } from '@/lib/contracts'

const BOUNTY_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_BOUNTY_MANAGER_ADDRESS as `0x${string}`
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || ''

// Store last checked timestamp in-memory (use Redis/KV for production)
let lastCheckedTimestamp = Date.now() - 5 * 60 * 1000 // Start 5 minutes ago

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('Unauthorized cron request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!NEYNAR_API_KEY) {
      return NextResponse.json({ error: 'NEYNAR_API_KEY not configured' }, { status: 500 })
    }

    console.log('🔍 Searching for bounty casts...')

    // Search for casts with bounty keywords (works on free tier!)
    const mentions = await searchForBountyCasts()
    
    if (!mentions || mentions.length === 0) {
      console.log('📭 No new bounty casts found')
      return NextResponse.json({ processed: 0, message: 'No new bounty casts' })
    }

    console.log(`📬 Found ${mentions.length} potential bounty cast(s)`)

    let processedCount = 0
    const results = []

    // Process each cast
    for (const cast of mentions) {
      // Skip if too old (already processed)
      const castTimestamp = new Date(cast.timestamp).getTime()
      if (castTimestamp <= lastCheckedTimestamp) {
        console.log(`⏭️  Already checked: ${cast.hash}`)
        continue
      }

      console.log(`📢 Processing mention from @${cast.author.username}: "${cast.text}"`)

      // Parse bounty from cast
      const parsedBounty = parseBountyFromCast(cast.text)

      if (!parsedBounty.isValid) {
        console.log('❌ Invalid bounty format:', parsedBounty.errors)
        
        results.push({ 
          castHash: cast.hash, 
          success: false, 
          errors: parsedBounty.errors 
        })
        continue
      }

      // Create bounty on-chain
      try {
        const creatorAddress = cast.author?.verified_addresses?.eth_addresses?.[0] || 
                               cast.author?.custody_address ||
                               '0x0000000000000000000000000000000000000000'
        
        const txHash = await createBountyOnChain(parsedBounty, creatorAddress)
        
        console.log('✅ Bounty created! TX:', txHash)

        results.push({ 
          castHash: cast.hash, 
          success: true, 
          txHash,
          bounty: parsedBounty 
        })
        processedCount++
      } catch (error: any) {
        console.error('❌ Error creating bounty:', error)
        
        results.push({ 
          castHash: cast.hash, 
          success: false, 
          error: error.message 
        })
      }
    }

    // Update last checked timestamp
    if (mentions.length > 0) {
      const latestTimestamp = Math.max(...mentions.map((m: any) => new Date(m.timestamp).getTime()))
      lastCheckedTimestamp = latestTimestamp
    }

    console.log(`✨ Processed ${processedCount} new bounty(ies)`)

    return NextResponse.json({ 
      processed: processedCount,
      results,
      message: `Processed ${processedCount} new bounty(ies)`
    })

  } catch (error: any) {
    console.error('Monitor error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * Search for casts containing bounty keywords
 * Works on free tier - no FID needed!
 */
async function searchForBountyCasts(): Promise<any[]> {
  try {
    if (!NEYNAR_API_KEY) return []

    // Search for casts with bounty-related keywords
    const searchQuery = encodeURIComponent('create bounty reward OR #bounty OR bug bounty')
    
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/cast/search?q=${searchQuery}&limit=25`,
      {
        headers: {
          'accept': 'application/json',
          'api_key': NEYNAR_API_KEY,
        },
      }
    )

    if (!response.ok) {
      console.error('Failed to search casts:', response.statusText)
      return []
    }

    const data = await response.json()
    return data.casts || []
  } catch (error) {
    console.error('Error searching casts:', error)
    return []
  }
}

/**
 * Create bounty on-chain
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
