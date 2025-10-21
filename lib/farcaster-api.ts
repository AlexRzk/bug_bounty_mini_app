/**
 * Farcaster API Client
 * Uses Neynar API for Farcaster interactions (mentions, casts, replies)
 * Documentation: https://docs.neynar.com/
 */

const NEYNAR_API_BASE = 'https://api.neynar.com/v2'

export interface FarcasterUser {
  fid: number
  username: string
  displayName: string
  pfpUrl: string
  custody_address: string
  verifications: string[]
}

export interface FarcasterCast {
  hash: string
  author: FarcasterUser
  text: string
  timestamp: string
  parent_hash?: string
  mentions?: FarcasterUser[]
  embeds?: any[]
}

export interface CastReplyOptions {
  text: string
  parentHash: string
  signerUuid: string // Neynar managed signer
}

export class FarcasterAPI {
  private apiKey: string

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('NEYNAR_API_KEY is required')
    }
    this.apiKey = apiKey
  }

  /**
   * Publish a reply to a cast
   */
  async publishCast(options: CastReplyOptions): Promise<{ hash: string; success: boolean }> {
    try {
      const response = await fetch(`${NEYNAR_API_BASE}/farcaster/cast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api_key': this.apiKey,
        },
        body: JSON.stringify({
          signer_uuid: options.signerUuid,
          text: options.text,
          parent: options.parentHash,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to publish cast: ${error}`)
      }

      const data = await response.json()
      return {
        hash: data.cast.hash,
        success: true,
      }
    } catch (error) {
      console.error('Error publishing cast:', error)
      return { hash: '', success: false }
    }
  }

  /**
   * Get cast details by hash
   */
  async getCast(castHash: string): Promise<FarcasterCast | null> {
    try {
      const response = await fetch(
        `${NEYNAR_API_BASE}/farcaster/cast?identifier=${castHash}&type=hash`,
        {
          headers: {
            'api_key': this.apiKey,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch cast: ${response.statusText}`)
      }

      const data = await response.json()
      return data.cast
    } catch (error) {
      console.error('Error fetching cast:', error)
      return null
    }
  }

  /**
   * Get user by FID
   */
  async getUserByFid(fid: number): Promise<FarcasterUser | null> {
    try {
      const response = await fetch(
        `${NEYNAR_API_BASE}/farcaster/user/bulk?fids=${fid}`,
        {
          headers: {
            'api_key': this.apiKey,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.statusText}`)
      }

      const data = await response.json()
      return data.users[0] || null
    } catch (error) {
      console.error('Error fetching user:', error)
      return null
    }
  }

  /**
   * Verify webhook signature from Neynar
   */
  static verifyWebhookSignature(
    payload: string,
    signature: string,
    webhookSecret: string
  ): boolean {
    // Neynar uses HMAC-SHA256 for webhook signatures
    const crypto = require('crypto')
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex')
    
    return signature === expectedSignature
  }
}

/**
 * Initialize Farcaster API client
 */
export function createFarcasterClient(): FarcasterAPI | null {
  const apiKey = process.env.NEYNAR_API_KEY
  
  if (!apiKey) {
    console.warn('NEYNAR_API_KEY not configured. Farcaster features disabled.')
    return null
  }

  return new FarcasterAPI(apiKey)
}
