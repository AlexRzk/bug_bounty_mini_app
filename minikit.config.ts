/**
 * Farcaster Mini App Configuration for BountyBuggy
 * Enables the app to run as a Farcaster Frame/Mini App on Base
 * 
 * Documentation: https://docs.farcaster.xyz/reference/frames/spec
 * Base Mini Apps: https://docs.base.org/guides/mini-apps
 * 
 * To enable full Mini App support, install:
 * npm install @farcaster/frames.js @farcaster/hub-web
 */

export interface MinikitConfig {
  title: string
  description: string
  image: { url: string; aspectRatio: string }
  buttons?: Array<{ label: string; action: string; target: string }>
  input?: { text: string }
  imageAspectRatio?: string
  refreshPeriod?: number
  postUrl?: string
  state?: { compressed: boolean }
  hub?: { apiUrl?: string; apiKey?: string }
  blockchain?: { chainId: string; chainName: string; rpcUrl: string; currency: string }
  app?: { name: string; description: string; url: string; icon: string }
  user?: { fid: number | null; username: string | null; pfp: string | null; castHash: string | null }
  contract?: { address: string; chainId: number }
  debug?: boolean
  cache?: { maxAge: number; sMaxAge: number }
}

export const minikitConfig: MinikitConfig = {
  // Frame metadata
  title: 'BountyBuggy - Secure Bounty Platform',
  description: 'Create and solve security bounties on Base with Farcaster integration',
  
  // Image for frame preview (1200x630px recommended)
  image: {
    url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/og-image.png`,
    aspectRatio: '1.91:1',
  },

  // Frame buttons and actions
  buttons: [
    {
      label: 'View Bounties',
      action: 'link',
      target: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/`,
    },
    {
      label: 'Create Bounty',
      action: 'link',
      target: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/#create`,
    },
    {
      label: 'Admin Panel',
      action: 'link',
      target: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/admin`,
    },
  ],

  // Farcaster Frame input
  input: {
    text: 'Search bounties...',
  },

  // Frame validation and security
  imageAspectRatio: '1.91:1',
  refreshPeriod: 300, // Refresh frame every 5 minutes

  // Post URL (where frame posts are processed)
  postUrl: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/frame`,

  // Frame state (if using stateful frames)
  state: {
    compressed: true,
  },

  // Farcaster Hub configuration
  hub: {
    // Connect to Farcaster Hub for frame validation
    apiUrl: process.env.FARCASTER_HUB_URL || 'https://hub.farcaster.xyz',
    apiKey: process.env.FARCASTER_HUB_API_KEY,
  },

  // Base blockchain configuration
  blockchain: {
    chainId: 'base',
    chainName: 'Base Sepolia',
    rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://sepolia.base.org',
    currency: 'ETH',
  },

  // App metadata for Mini App
  app: {
    name: 'BountyBuggy',
    description: 'Security bounty platform with Farcaster integration',
    url: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
    icon: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/favicon.ico`,
  },

  // Farcaster user context (populated at runtime)
  user: {
    fid: null, // Farcaster ID (set at runtime from frame context)
    username: null, // Farcaster username
    pfp: null, // Profile picture URL
    castHash: null, // Hash of the cast that spawned the frame
  },

  // Contract configuration for frame interactions
  contract: {
    address: process.env.NEXT_PUBLIC_BOUNTY_CONTRACT || '0xBcEe9446a53605D70b172498F3A38e5Ec2b6dCCf',
    chainId: 84532, // Base Sepolia chain ID
  },

  // Enable development mode logging
  debug: process.env.NODE_ENV === 'development',

  // Frame cache settings
  cache: {
    maxAge: 300, // Cache for 5 minutes
    sMaxAge: 60, // Shared cache for 1 minute
  },
}

// Export for use in frame routes and pages
export default minikitConfig
