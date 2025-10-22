import { http, createConfig } from "wagmi"
import { base } from "wagmi/chains"
import { injected, walletConnect } from "wagmi/connectors"

// WalletConnect project ID - get from https://cloud.walletconnect.com/
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "b954d12db2eaf5783a48e8d7502aa36f"

// Base mainnet configuration
export const config = createConfig({
  chains: [base],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
    walletConnect({
      projectId,
      metadata: {
        name: "Buggy Bounty",
        description: "Secure bug bounty platform on Base blockchain",
        url: "https://bug-bounty-mini-app-swib.vercel.app",
        icons: ["https://bug-bounty-mini-app-swib.vercel.app/app-icon.png"],
      },
      showQrModal: true,
    }),
  ],
  transports: {
    [base.id]: http(),
  },
  ssr: true,
})
