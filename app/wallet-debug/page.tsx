"use client"

import { useAccount, useConnectorClient } from "wagmi"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"

export default function WalletDebugPage() {
  const { address, connector, isConnected } = useAccount()
  const { data: connectorClient } = useConnectorClient()
  const [providerInfo, setProviderInfo] = useState<any>(null)

  useEffect(() => {
    const inspectProvider = async () => {
      if (!connector) return

      try {
        const provider = await connector.getProvider()
        
        // Extract all available properties
        const info = {
          connectorName: connector.name,
          connectorId: connector.id,
          address: address,
          providerType: provider?.constructor?.name,
          providerKeys: provider ? Object.keys(provider) : [],
          
          // Check common basename/ENS locations
          session: (provider as any)?.session,
          metadata: (provider as any)?.metadata,
          baseName: (provider as any)?.baseName,
          ensName: (provider as any)?.ensName,
          accountMetadata: (provider as any)?.accountMetadata,
          
          // WalletConnect specific
          namespace: (provider as any)?.session?.namespaces,
          peer: (provider as any)?.session?.peer,
          
          // Full provider (be careful with circular references)
          rawProvider: provider ? JSON.stringify(provider, (key, value) => {
            if (typeof value === 'function') return '[Function]'
            if (typeof value === 'object' && value !== null) {
              // Limit depth to avoid circular references
              return value
            }
            return value
          }, 2).slice(0, 5000) : null,
        }
        
        setProviderInfo(info)
        console.log('🔍 Full Provider Inspection:', info)
      } catch (err) {
        console.error('Error inspecting provider:', err)
        setProviderInfo({ error: String(err) })
      }
    }

    if (isConnected) {
      inspectProvider()
    }
  }, [connector, address, isConnected])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Provider Debug</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Please connect your wallet to inspect provider data.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Provider Debug</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <strong>Connector:</strong> {connector?.name} ({connector?.id})
                </div>
                <div>
                  <strong>Address:</strong> {address}
                </div>
              </div>
            </CardContent>
          </Card>

          {providerInfo && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 font-mono text-sm">
                    <div><strong>Provider Type:</strong> {providerInfo.providerType}</div>
                    <div><strong>Available Keys:</strong> {providerInfo.providerKeys?.join(', ')}</div>
                    <div><strong>BaseName:</strong> {providerInfo.baseName || 'Not found'}</div>
                    <div><strong>ENS Name:</strong> {providerInfo.ensName || 'Not found'}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Session Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs overflow-auto max-h-96 bg-muted p-4 rounded">
                    {JSON.stringify(providerInfo.session, null, 2)}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs overflow-auto max-h-96 bg-muted p-4 rounded">
                    {JSON.stringify(providerInfo.metadata, null, 2)}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Raw Provider (truncated)</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs overflow-auto max-h-96 bg-muted p-4 rounded">
                    {providerInfo.rawProvider}
                  </pre>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
