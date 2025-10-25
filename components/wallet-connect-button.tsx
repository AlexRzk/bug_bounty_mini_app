"use client"

import { useAccount, useConnect, useDisconnect } from "wagmi"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Copy, Check } from "lucide-react"
import { useState, useEffect } from "react"
import styled from 'styled-components'
import { Address } from "viem"
import { useBasename, formatAddressOrBasename } from "@/hooks/use-basename"

const StyledButton = styled.button`
  border: none;
  width: 15em;
  height: 5em;
  border-radius: 3em;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  background: #1c1a1c;
  cursor: pointer;
  transition: all 450ms ease-in-out;

  .sparkle {
    fill: #aaaaaa;
    transition: all 800ms ease;
  }

  .text {
    font-weight: 600;
    color: #aaaaaa;
    font-size: medium;
  }

  &:hover {
    background: linear-gradient(0deg, #6899fe, blue);
    box-shadow:
      inset 0px 1px 0px 0px rgba(255, 255, 255, 0.4),
      inset 0px -4px 0px 0px rgba(0, 0, 0, 0.2),
      0px 0px 0px 4px rgba(255, 255, 255, 0.2),
      0px 0px 180px 0px #9917ff;
    transform: translateY(-2px);
  }

  &:hover .text {
    color: white;
  }

  &:hover .sparkle {
    fill: white;
    transform: scale(1.2);
  }
`

export function WalletConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { basename, isLoading: isResolving } = useBasename(address as Address)

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

  // Show connected state only after mount to prevent hydration mismatch
  const showConnected = mounted && isConnected && address

  if (showConnected) {
    const label = isResolving
      ? "Resolving..."
      : formatAddressOrBasename(address, basename)

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <StyledButton>
            <svg className="sparkle" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" fill="#FFFFFF" width={24} height={24}>
              <path clipRule="evenodd" d="M12 14a3 3 0 0 1 3-3h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a3 3 0 0 1-3-3Zm3-1a1 1 0 1 0 0 2h4v-2h-4Z" fillRule="evenodd" />
              <path clipRule="evenodd" d="M12.293 3.293a1 1 0 0 1 1.414 0L16.414 6h-2.828l-1.293-1.293a1 1 0 0 1 0-1.414ZM12.414 6 9.707 3.293a1 1 0 0 0-1.414 0L5.586 6h6.828ZM4.586 7l-.056.055A2 2 0 0 0 3 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2h-4a5 5 0 0 1 0-10h4a2 2 0 0 0-1.53-1.945L17.414 7H4.586Z" fillRule="evenodd" />
            </svg>
            <span className="text" title={basename ?? address}>
              {label}
            </span>
          </StyledButton>
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
        <StyledButton>
          <svg className="sparkle" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" fill="#FFFFFF" width={24} height={24}>
            <path clipRule="evenodd" d="M12 14a3 3 0 0 1 3-3h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a3 3 0 0 1-3-3Zm3-1a1 1 0 1 0 0 2h4v-2h-4Z" fillRule="evenodd" />
            <path clipRule="evenodd" d="M12.293 3.293a1 1 0 0 1 1.414 0L16.414 6h-2.828l-1.293-1.293a1 1 0 0 1 0-1.414ZM12.414 6 9.707 3.293a1 1 0 0 0-1.414 0L5.586 6h6.828ZM4.586 7l-.056.055A2 2 0 0 0 3 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2h-4a5 5 0 0 1 0-10h4a2 2 0 0 0-1.53-1.945L17.414 7H4.586Z" fillRule="evenodd" />
          </svg>
          <span className="text">Connect</span>
        </StyledButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-card/95 backdrop-blur-xl border-primary/20 shadow-2xl shadow-primary/10"
      >
        <DropdownMenuLabel className="text-muted-foreground">Connect to Base</DropdownMenuLabel>
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
