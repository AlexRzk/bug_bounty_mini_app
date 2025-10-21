/**
 * Farcaster Webhook Handler
 * Receives notifications when users mention the bot or interact with casts
 * Route: POST /api/webhook/farcaster
 * 
 * Setup:
 * 1. Create webhook at https://dev.neynar.com/
 * 2. Subscribe to 'cast.created' events with mention filter
 * 3. Add NEYNAR_WEBHOOK_SECRET to .env
 */

import { NextRequest, NextResponse } from 'next/server'
import { createFarcasterClient, FarcasterAPI } from '@/lib/farcaster-api'
import { parseBountyFromCast, formatBountyConfirmation, formatBountyError } from '@/lib/bounty-parser'
import { createPublicClient, createWalletClient, http, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'
import { bountyManagerAbi } from '@/lib/contracts'

const BOUNTY_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_BOUNTY_MANAGER_ADDRESS as `0x${string}`

export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature
    const signature = req.headers.get('x-neynar-signature') || ''
    const webhookSecret = process.env.NEYNAR_WEBHOOK_SECRET || ''
    
    const rawBody = await req.text()
    
    if (webhookSecret && !FarcasterAPI.verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const body = JSON.parse(rawBody)
    
    console.log('📨 Received Farcaster webhook:', body.type)

    // Handle cast.created events (mentions)
    if (body.type === 'cast.created') {
      const cast = body.data
      const { hash, text, author } = cast

      console.log(`📢 New mention from @${author.username}: "${text}"`)

      // Parse bounty from cast text
      const parsedBounty = parseBountyFromCast(text)

      if (!parsedBounty.isValid) {
        console.log('❌ Invalid bounty format:', parsedBounty.errors)
        
        // Reply with error message
        await replyToCast(hash, formatBountyError(parsedBounty.errors))
        
        return NextResponse.json({ 
          success: false, 
          errors: parsedBounty.errors 
        })
      }

      // Create bounty on-chain
      console.log('🔨 Creating bounty on-chain:', parsedBounty)
      
      try {
        const txHash = await createBountyOnChain(parsedBounty, author.verifications[0] || author.custody_address)
        
        console.log('✅ Bounty created! TX:', txHash)

        // Reply with success message
        await replyToCast(hash, formatBountyConfirmation(parsedBounty, txHash))

        return NextResponse.json({ 
          success: true, 
          txHash,
          bounty: parsedBounty
        })
      } catch (error: any) {
        console.error('❌ Error creating bounty on-chain:', error)
        
        await replyToCast(hash, `❌ Failed to create bounty: ${error.message}\n\nPlease check your wallet has sufficient ETH on Base mainnet.`)
        
        return NextResponse.json({ 
          success: false, 
          error: error.message 
        }, { status: 500 })
      }
    }

    // Handle other webhook events
    return NextResponse.json({ success: true, message: 'Event processed' })
    
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * Reply to a cast with a message
 */
async function replyToCast(parentHash: string, message: string): Promise<void> {
  const farcasterClient = createFarcasterClient()
  const signerUuid = process.env.NEYNAR_SIGNER_UUID

  if (!farcasterClient || !signerUuid) {
    console.warn('Farcaster client or signer not configured, skipping reply')
    return
  }

  try {
    const result = await farcasterClient.publishCast({
      text: message,
      parentHash,
      signerUuid,
    })

    if (result.success) {
      console.log('✅ Reply published:', result.hash)
    } else {
      console.error('❌ Failed to publish reply')
    }
  } catch (error) {
    console.error('Error publishing reply:', error)
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
    throw new Error('BOT_PRIVATE_KEY not configured - needed to submit transactions')
  }

  // Create wallet client
  const account = privateKeyToAccount(botPrivateKey as `0x${string}`)
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
  })

  // Create public client for reading
  const publicClient = createPublicClient({
    chain: base,
    transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
  })

  // Map severity to contract enum (0=Low, 1=Medium, 2=High, 3=Critical)
  const severityMap: Record<string, number> = {
    low: 0,
    medium: 1,
    high: 2,
    critical: 3,
  }

  const rewardWei = parseEther(bounty.reward)

  // Prepare transaction
  const { request } = await publicClient.simulateContract({
    address: BOUNTY_MANAGER_ADDRESS,
    abi: bountyManagerAbi,
    functionName: 'createBounty',
    args: [
      bounty.title,
      bounty.description,
      severityMap[bounty.severity.toLowerCase()] || 1,
      creatorAddress as `0x${string}`, // Original creator from Farcaster
    ],
    account,
    value: rewardWei,
  })

  // Execute transaction
  const hash = await walletClient.writeContract(request)

  return hash
}

// Disable body parsing to verify webhook signature
export const config = {
  api: {
    bodyParser: false,
  },
}
