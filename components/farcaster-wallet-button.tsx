"use client"

import { useEffect, useMemo, useState } from "react"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { sdk } from "@farcaster/miniapp-sdk"
import { Address } from "viem"
import { useBasename, formatAddressOrBasename } from "@/hooks/use-basename"
import styled from 'styled-components'

const StyledButton = styled.button`
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .sparkle {
    fill: #ffffff;
    transition: all 300ms ease;
    width: 18px;
    height: 18px;
  }

  .text {
    font-weight: 600;
    color: #ffffff;
    font-size: 14px;
  }
`

export function FarcasterWalletButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [mounted, setMounted] = useState(false)
  const [isInFarcaster, setIsInFarcaster] = useState(false)
  const wagmiAddress = useMemo(() => (address ? (address as Address) : undefined), [address])
  const { basename, isLoading: isResolving } = useBasename(wagmiAddress)

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

  if (!mounted) {
    return (
      <StyledButton disabled>
        <span className="button-content">
          <svg className="sparkle" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" fill="#FFFFFF" width={18} height={18}>
            <path clipRule="evenodd" d="M12 14a3 3 0 0 1 3-3h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a3 3 0 0 1-3-3Zm3-1a1 1 0 1 0 0 2h4v-2h-4Z" fillRule="evenodd" />
            <path clipRule="evenodd" d="M12.293 3.293a1 1 0 0 1 1.414 0L16.414 6h-2.828l-1.293-1.293a1 1 0 0 1 0-1.414ZM12.414 6 9.707 3.293a1 1 0 0 0-1.414 0L5.586 6h6.828ZM4.586 7l-.056.055A2 2 0 0 0 3 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2h-4a5 5 0 0 1 0-10h4a2 2 0 0 0-1.53-1.945L17.414 7H4.586Z" fillRule="evenodd" />
          </svg>
          <span className="text">Loading...</span>
        </span>
      </StyledButton>
    )
  }

  if (isConnected && address) {
    const label = isResolving
      ? "Resolving..."
      : formatAddressOrBasename(address, basename)

    return (
      <div className="flex items-center gap-2">
        <StyledButton disabled title={basename ?? address}>
          <span className="button-content">
            <svg className="sparkle" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" fill="#FFFFFF" width={18} height={18}>
              <path clipRule="evenodd" d="M12 14a3 3 0 0 1 3-3h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a3 3 0 0 1-3-3Zm3-1a1 1 0 1 0 0 2h4v-2h-4Z" fillRule="evenodd" />
              <path clipRule="evenodd" d="M12.293 3.293a1 1 0 0 1 1.414 0L16.414 6h-2.828l-1.293-1.293a1 1 0 0 1 0-1.414ZM12.414 6 9.707 3.293a1 1 0 0 0-1.414 0L5.586 6h6.828ZM4.586 7l-.056.055A2 2 0 0 0 3 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2h-4a5 5 0 0 1 0-10h4a2 2 0 0 0-1.53-1.945L17.414 7H4.586Z" fillRule="evenodd" />
            </svg>
            <span className="text">{label}</span>
          </span>
        </StyledButton>
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
    <StyledButton onClick={handleConnect}>
      <span className="button-content">
        <svg className="sparkle" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" fill="#FFFFFF" width={18} height={18}>
          <path clipRule="evenodd" d="M12 14a3 3 0 0 1 3-3h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a3 3 0 0 1-3-3Zm3-1a1 1 0 1 0 0 2h4v-2h-4Z" fillRule="evenodd" />
          <path clipRule="evenodd" d="M12.293 3.293a1 1 0 0 1 1.414 0L16.414 6h-2.828l-1.293-1.293a1 1 0 0 1 0-1.414ZM12.414 6 9.707 3.293a1 1 0 0 0-1.414 0L5.586 6h6.828ZM4.586 7l-.056.055A2 2 0 0 0 3 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2h-4a5 5 0 0 1 0-10h4a2 2 0 0 0-1.53-1.945L17.414 7H4.586Z" fillRule="evenodd" />
        </svg>
        <span className="text">{isInFarcaster ? "Connect Farcaster Wallet" : "Connect"}</span>
      </span>
    </StyledButton>
  )
}
