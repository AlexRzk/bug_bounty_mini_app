'use client'

import { useEffect, useState } from 'react'

/**
 * Frame Initializer - Initializes Farcaster Frame SDK
 * Must be rendered at the root level of the app
 * Calls sdk.actions.ready() when the frame is loaded
 */
export function FrameInitializer() {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Try to initialize Farcaster Frame SDK
    const initFrame = async () => {
      try {
        // Dynamically import to avoid issues in non-frame context
        const { default: sdk } = await import('@farcaster/frame-sdk')
        
        // Call ready synchronously if available
        if (sdk?.actions?.ready) {
          // ready() can be called synchronously
          sdk.actions.ready()
          console.log('✅ Farcaster Frame SDK ready() called')
          setIsReady(true)
        }

        // Get frame context for debugging
        try {
          const context = await sdk.context
          console.log('Frame context:', {
            user: context?.user,
            client: context?.client,
          })
        } catch (e) {
          console.log('No frame context available (running outside Farcaster)')
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.warn('Frame SDK not available:', message)
        setError(message)
      }
    }

    // Call immediately, but allow DOM to paint first
    const timeoutId = setTimeout(() => {
      initFrame()
    }, 0)

    return () => clearTimeout(timeoutId)
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
        const { default: sdk } = await import('@farcaster/frame-sdk')
        const context = await sdk.context
        
        if (context) {
          setIsInFrame(true)
          setIsReady(true)
        } else {
          setIsInFrame(false)
        }
      } catch (err) {
        console.log('Not in frame context:', err)
        setIsInFrame(false)
        setIsReady(false)
      }
    }

    checkFrame()
  }, [])

  return { isReady, isInFrame }
}
