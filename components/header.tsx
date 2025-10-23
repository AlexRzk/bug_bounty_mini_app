"use client"

import { AlertCircle } from "lucide-react"
import { FarcasterWalletButton } from "@/components/farcaster-wallet-button"
import { useAccount, useSwitchChain } from "wagmi"
import { base } from "wagmi/chains"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"

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
          <Image 
            src="/topleftlogo.png" 
            alt="Bug Bounty Hunter Logo" 
            width={40} 
            height={40}
            className="object-contain"
          />
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Bug Bounty Hunter</h1>
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
