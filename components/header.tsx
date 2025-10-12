import { Shield } from "lucide-react"
import { WalletConnectButton } from "@/components/wallet-connect-button"

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Bug Bounty Board</h1>
            <p className="text-xs text-muted-foreground">Powered by Base Testnet</p>
          </div>
        </div>
        <WalletConnectButton />
      </div>
    </header>
  )
}
