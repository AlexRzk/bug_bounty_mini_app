import { http, createConfig } from "wagmi"
import { baseSepolia } from "wagmi/chains"
import { injected, walletConnect } from "wagmi/connectors"

// Base Sepolia testnet configuration
const getConnectors = () => {
  const connectors = [injected()];
  
  // Only add WalletConnect if project ID is provided
  if (process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
    connectors.push(
      walletConnect({
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
      }) as any // Type workaround for wagmi connector compatibility
    );
  }
  
  return connectors;
};

export const config = createConfig({
  chains: [baseSepolia],
  connectors: getConnectors(),
  transports: {
    [baseSepolia.id]: http(),
  },
})
