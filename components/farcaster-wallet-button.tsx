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
      // In Farcaster Mini Apps, use the standard injected connector
      // The Farcaster app provides an Ethereum provider automatically
      try {
        console.log("Connecting wallet in Farcaster context...")
        const injectedConnector = connectors.find((c) => c.id === "injected")
        if (injectedConnector) {
          await connect({ connector: injectedConnector })
          console.log("Connected to wallet in Farcaster")
        } else {
          console.error("No injected connector found")
        }
      } catch (error) {
        console.error("Farcaster wallet connection failed:", error)
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
