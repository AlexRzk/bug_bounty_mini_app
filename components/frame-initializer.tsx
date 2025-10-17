'use client'

import { useEffect, useState } from 'react'
import sdk from '@farcaster/frame-sdk'

/**
 * Frame Initializer - Initializes Farcaster Frame SDK
 * Must be rendered at the root level of the app
 * Calls sdk.actions.ready() when the frame is loaded
 */
export function FrameInitializer() {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function initFrame() {
      try {
        // Initialize Farcaster Frame SDK
        await sdk.actions.ready()
        setIsReady(true)
        console.log('✅ Farcaster Frame SDK initialized')

        // Optional: Set initial context
        const context = await sdk.context
        console.log('Frame context:', {
          user: context?.user,
          client: context?.client,
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        setError(message)
        console.error('❌ Frame initialization error:', message)
      }
    }

    // Only initialize if running in Farcaster context
    if (typeof window !== 'undefined') {
      initFrame()
    }
  }, [])

  // Don't render anything - this is just for initialization
  return null
}

/**
 * Hook to check if frame is ready
 */
export function useFrameReady() {
  const [isReady, setIsReady] = useState(false)
  const [isInFrame, setIsInFrame] = useState(false)

  useEffect(() => {
    const checkFrame = async () => {
      try {
        const isFrameContext = sdk.context
        setIsInFrame(!!isFrameContext)

        if (isFrameContext) {
          await sdk.actions.ready()
          setIsReady(true)
        }
      } catch (err) {
        console.log('Not in frame context:', err)
        setIsInFrame(false)
      }
    }

    checkFrame()
  }, [])

  return { isReady, isInFrame }
}
