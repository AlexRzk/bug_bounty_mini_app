"use client"

import { useAccount, useConnect, useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Wallet, LogOut, Copy, Check } from "lucide-react"
import { useState, useEffect } from "react"
import "./wallet-button-custom.css"

export function WalletConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Fix hydration error by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Show connected state only after mount to prevent hydration mismatch
  const showConnected = mounted && isConnected && address

  if (showConnected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="wallet-btn wallet-btn-connected">
            <Wallet className="wallet-btn-icon h-4 w-4" />
            <span className="wallet-btn-text">{formatAddress(address)}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-56 bg-card/95 backdrop-blur-xl border-primary/20 shadow-2xl shadow-primary/10"
        >
          <DropdownMenuLabel className="text-muted-foreground">My Wallet</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border/50" />
          <DropdownMenuItem 
            onClick={handleCopyAddress} 
            className="gap-2 cursor-pointer hover:bg-primary/10 transition-all duration-200"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy Address"}
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border/50" />
          <DropdownMenuItem 
            onClick={() => disconnect()} 
            className="gap-2 text-destructive hover:bg-destructive/10 cursor-pointer transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="wallet-btn">
          <Wallet className="wallet-btn-icon h-4 w-4" />
          <span className="wallet-btn-text">Connect Wallet</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-card/95 backdrop-blur-xl border-primary/20 shadow-2xl shadow-primary/10"
      >
        <DropdownMenuLabel className="text-muted-foreground">Connect to Base Sepolia</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50" />
        {mounted ? (
          connectors.map((connector) => (
            <DropdownMenuItem 
              key={connector.id} 
              onClick={() => connect({ connector })} 
              className="cursor-pointer hover:bg-primary/10 transition-all duration-200"
            >
              {connector.name}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
