'use client'

import { useEffect } from 'react'

/**
 * Frame Initializer - Initializes Farcaster Frame SDK
 * Must be rendered at the root level of the app
 * Calls sdk.actions.ready() synchronously when the frame is loaded
 */
export function FrameInitializer() {
  useEffect(() => {
    // Import and call ready() synchronously without async wrapper
    let sdk: any
    
    try {
      // Use require for synchronous import in useEffect
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      sdk = require('@farcaster/frame-sdk')
      
      if (sdk?.actions?.ready) {
        // Call ready() immediately - must be synchronous
        sdk.actions.ready()
        console.log('✅ Farcaster Frame SDK ready() called successfully')
      } else {
        console.warn('⚠️ sdk.actions.ready not found')
      }
    } catch (err) {
      // SDK not available or not in frame context - this is fine
      console.debug('Frame SDK initialization:', err instanceof Error ? err.message : String(err))
    }
  }, [])

  // Don't render anything - this is just for initialization
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
