'use client'

import { useEffect, useState } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

/**
 * Mini App Initializer - Initializes Farcaster Mini App SDK
 * Must be rendered at the root level of the app
 * Calls sdk.actions.ready() to dismiss splash screen
 */
export function FrameInitializer() {
  useEffect(() => {
    // Call ready() to dismiss Farcaster splash screen
    const initializeMiniApp = async () => {
      try {
        // Wait for app to be fully loaded and ready to display
        await sdk.actions.ready()
        console.log('✅ Farcaster Mini App ready() called')
      } catch (err) {
        // Not in Farcaster Mini App context or SDK not available
        console.debug('Mini App SDK not available (normal when testing outside Farcaster)', err)
      }
    }

    initializeMiniApp()
  }, [])

  return null
}

/**
 * Hook to check if Mini App is ready and get context
 */
export function useFrameReady() {
  const [context, setContext] = useState<any>(null)

  useEffect(() => {
    // Get Mini App context
    const getContext = async () => {
      try {
        const ctx = await sdk.context
        setContext(ctx)
        
        if (ctx?.user?.fid) {
          console.log(`Mini App user FID: ${ctx.user.fid}`)
        }
        
        // Log location context
        if (ctx?.location) {
          console.log(`Mini App location:`, ctx.location)
        }
      } catch (err) {
        console.debug('Not in Farcaster Mini App context')
      }
    }

    getContext()
  }, [])

  return { ready: true, context }
}
