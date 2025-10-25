'use client'

import { http, createConfig } from "wagmi"
import { base, baseSepolia } from "wagmi/chains"
import { injected, walletConnect } from "wagmi/connectors"

// WalletConnect project ID - get from https://cloud.walletconnect.com/
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "b954d12db2eaf5783a48e8d7502aa36f"

// Use Sepolia for testing V3, Base mainnet for production
const IS_TESTNET = process.env.NEXT_PUBLIC_USE_TESTNET === "true"

// Base configuration with testnet support
export const config = createConfig({
  chains: IS_TESTNET ? [baseSepolia] : [base],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
    walletConnect({
      projectId,
      metadata: {
        name: "Bug Bounty Hunter",
        description: "Secure bug bounty platform on Base blockchain",
        url: "https://bug-bounty-mini-app-swib.vercel.app",
        icons: ["https://bug-bounty-mini-app-swib.vercel.app/app-icon.png"],
      },
      showQrModal: true,
    }),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  ssr: false,
})
