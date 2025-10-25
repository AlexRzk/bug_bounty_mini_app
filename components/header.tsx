"use client"

import { AlertCircle, Info, Trophy, Menu, X } from "lucide-react"
import { FarcasterWalletButton } from "@/components/farcaster-wallet-button"
import { useAccount, useSwitchChain } from "wagmi"
import { base, baseSepolia } from "wagmi/chains"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import GradientText from "@/components/GradientText"
import styled from 'styled-components'
import { isMiniAppContext } from "@/lib/miniapp-detection"

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
  const [isMiniApp, setIsMiniApp] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    setIsMiniApp(isMiniAppContext())
  }, [])

  const isCorrectNetwork = chain?.id === TARGET_CHAIN.id

  // Compact header for mini-app
  if (isMiniApp) {
    return (
      <header className="bg-card sticky top-0 z-50">
        <div className="flex items-center justify-between px-3 py-2">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/topleftlogo.png" 
              alt="Logo" 
              width={32} 
              height={32}
              className="object-contain"
            />
            <span className="text-sm font-bold">Bug Bounty</span>
          </Link>
          <div className="flex items-center gap-2">
            <FarcasterWalletButton compact />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-border bg-card/95 backdrop-blur">
            <div className="px-3 py-2 space-y-1">
              <Link
                href="/about"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <Info className="h-4 w-4" />
                <span className="text-sm">About</span>
              </Link>
              <Link
                href="/leaderboard"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <Trophy className="h-4 w-4" />
                <span className="text-sm">Leaderboard</span>
              </Link>
              {mounted && isConnected && !isCorrectNetwork && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    switchChain?.({ chainId: TARGET_CHAIN.id })
                    setMenuOpen(false)
                  }}
                  className="w-full gap-2"
                >
                  <AlertCircle className="h-4 w-4" />
                  Switch to {TARGET_CHAIN.name}
                </Button>
              )}
            </div>
          </div>
        )}
      </header>
    )
  }

  // Full header for web
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
