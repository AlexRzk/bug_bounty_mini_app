"use client"

import { Shield, AlertCircle } from "lucide-react"
import { FarcasterWalletButton } from "@/components/farcaster-wallet-button"
import { useAccount, useSwitchChain } from "wagmi"
import { base } from "wagmi/chains"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import Link from "next/link"

export function Header() {
  const { chain, isConnected } = useAccount()
  const { switchChain } = useSwitchChain()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const isCorrectNetwork = chain?.id === base.id

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">BountyBuggy</h1>
            <p className="text-xs text-muted-foreground">Secure, Fast, Rewarding</p>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          {mounted && isConnected && !isCorrectNetwork && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => switchChain?.({ chainId: base.id })}
              className="gap-2"
            >
              <AlertCircle className="h-4 w-4" />
              Switch to Base
            </Button>
          )}
          <FarcasterWalletButton />
        </div>
      </div>
    </header>
  )
}
