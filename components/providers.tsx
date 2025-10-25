"use client"

import type React from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { config } from "@/lib/wagmi-config"
import { FrameInitializer } from "@/components/frame-initializer"
import { useState, useEffect } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Prevent refetch on mount in dev mode
        refetchOnWindowFocus: false,
        staleTime: 60000,
      },
    },
  }))

  // Suppress WalletConnect double init warning in dev mode
  useEffect(() => {
    const originalError = console.error
    console.error = (...args) => {
      if (args[0]?.includes?.('WalletConnect Core is already initialized')) {
        return
      }
      if (args[0]?.includes?.('Cannot set property ethereum')) {
        return
      }
      originalError.apply(console, args)
    }
    return () => {
      console.error = originalError
    }
  }, [])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <FrameInitializer />
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
