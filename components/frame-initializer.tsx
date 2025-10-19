'use client'

import { useEffect } from 'react'

/**
 * Frame Initializer - Initializes Farcaster Frame SDK
 * Must be rendered at the root level of the app
 * Calls sdk.actions.ready() to dismiss splash screen
 */
export function FrameInitializer() {
  useEffect(() => {
    // Call ready() to dismiss Farcaster splash screen
    const initializeFrame = async () => {
      try {
        // Dynamic import of Farcaster Frame SDK
        const sdk = await import('@farcaster/frame-sdk')
        
        if (sdk?.default?.actions?.ready) {
          // Call ready() to signal frame is loaded
          await sdk.default.actions.ready()
          console.log('✅ Farcaster Frame ready() called')
        } else if ((sdk as any)?.actions?.ready) {
          await (sdk as any).actions.ready()
          console.log('✅ Farcaster Frame ready() called')
        }
      } catch (err) {
        // Not in Farcaster frame context or SDK not available
        console.debug('Frame SDK not available (normal when testing outside Farcaster)')
      }
    }

    initializeFrame()
  }, [])

  return null
}

/**
 * Hook to check if frame is ready and get frame context
 */
export function useFrameReady() {
  useEffect(() => {
    // Check if we have frame context available
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const sdk = require('@farcaster/frame-sdk')
      sdk.context?.then((context: any) => {
        if (context?.user?.fid) {
          console.log(`Frame user FID: ${context.user.fid}`)
        }
      }).catch(() => {
        console.debug('Not in Farcaster frame context')
      })
    } catch (err) {
      // SDK not available
    }
  }, [])

  return true
}
