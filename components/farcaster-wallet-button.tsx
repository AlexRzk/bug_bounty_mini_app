"use client"

import { useEffect, useState } from "react"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"
import { Wallet, LogOut } from "lucide-react"
import { sdk } from "@farcaster/miniapp-sdk"

export function FarcasterWalletButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [mounted, setMounted] = useState(false)
  const [isInFarcaster, setIsInFarcaster] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Check if we're in Farcaster Mini App
    const checkFarcasterContext = async () => {
      try {
        const context = await sdk.context
        setIsInFarcaster(!!context)
        console.log("Farcaster context:", context)
      } catch (err) {
        console.log("Not in Farcaster context")
        setIsInFarcaster(false)
      }
    }
    
    checkFarcasterContext()
  }, [])

  const handleConnect = async () => {
    if (isInFarcaster) {
      // Use MiniKit's wallet connection for Farcaster
      try {
        console.log("Requesting Farcaster wallet connection...")
        
        // Request wallet address from Farcaster
        const result = await sdk.actions.connectWallet()
        console.log("Farcaster wallet result:", result)
        
        if (result?.address) {
          console.log("Connected to Farcaster wallet:", result.address)
          // The wallet should now be connected through wagmi
        }
      } catch (error) {
        console.error("Farcaster wallet connection failed:", error)
        // Fallback to injected connector
        const injectedConnector = connectors.find((c) => c.id === "injected")
        if (injectedConnector) {
          connect({ connector: injectedConnector })
        }
      }
    } else {
      // Use standard wallet connection for non-Farcaster
      const injectedConnector = connectors.find((c) => c.id === "injected")
      if (injectedConnector) {
        connect({ connector: injectedConnector })
      }
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (!mounted) {
    return (
      <Button variant="outline" disabled>
        <Wallet className="mr-2 h-4 w-4" />
        Loading...
      </Button>
    )
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" disabled className="font-mono">
          <Wallet className="mr-2 h-4 w-4" />
          {formatAddress(address)}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => disconnect()}
          title="Disconnect"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={handleConnect} variant="default" className="gap-2">
      <Wallet className="h-4 w-4" />
      {isInFarcaster ? "Connect Farcaster Wallet" : "Connect Wallet"}
    </Button>
  )
}
