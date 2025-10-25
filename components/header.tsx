"use client"

import { AlertCircle, Info, Trophy } from "lucide-react"
import { FarcasterWalletButton } from "@/components/farcaster-wallet-button"
import { useAccount, useSwitchChain } from "wagmi"
import { base, baseSepolia } from "wagmi/chains"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import GradientText from "@/components/GradientText"
import styled from 'styled-components'

// Use Sepolia for testing, mainnet for production
const IS_TESTNET = process.env.NEXT_PUBLIC_USE_TESTNET === "true"
const TARGET_CHAIN = IS_TESTNET ? baseSepolia : base

const StyledGradientButton = styled.button`
  align-items: center;
  background-image: linear-gradient(144deg, #af40ff, #5b42f3 50%, #00ddeb);
  border: 0;
  border-radius: 8px;
  box-shadow: rgba(151, 65, 252, 0.2) 0 15px 30px -5px;
  box-sizing: border-box;
  color: #ffffff;
  display: flex;
  font-size: 16px;
  justify-content: center;
  line-height: 1em;
  max-width: 100%;
  min-width: 140px;
  padding: 3px;
  text-decoration: none;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.3s;
  gap: 8px;

  .button-content {
    background-color: rgb(5, 6, 45);
    padding: 12px 20px;
    border-radius: 6px;
    width: 100%;
    height: 100%;
    transition: 300ms;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  &:hover .button-content {
    background: none;
  }

  &:active {
    transform: scale(0.9);
  }
`

export function Header() {
  const { chain, isConnected } = useAccount()
  const { switchChain } = useSwitchChain()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const isCorrectNetwork = chain?.id === TARGET_CHAIN.id

  return (
    <header className="bg-card">
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
          <Link href="/about">
            <StyledGradientButton>
              <span className="button-content">
                <Info className="h-4 w-4" />
                About
              </span>
            </StyledGradientButton>
          </Link>
          <Link href="/leaderboard">
            <StyledGradientButton>
              <span className="button-content">
                <Trophy className="h-4 w-4" />
                Leaderboard
              </span>
            </StyledGradientButton>
          </Link>
          {mounted && isConnected && !isCorrectNetwork && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => switchChain?.({ chainId: TARGET_CHAIN.id })}
              className="gap-2"
            >
              <AlertCircle className="h-4 w-4" />
              Switch to {TARGET_CHAIN.name}
            </Button>
          )}
          <FarcasterWalletButton />
        </div>
      </div>
    </header>
  )
}
