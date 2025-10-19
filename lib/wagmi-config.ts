import { http, createConfig } from "wagmi"
import { baseSepolia } from "wagmi/chains"
import { injected } from "wagmi/connectors"

// Base Sepolia testnet configuration
export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],
  transports: {
    [baseSepolia.id]: http(),
  },
  ssr: true,
})
