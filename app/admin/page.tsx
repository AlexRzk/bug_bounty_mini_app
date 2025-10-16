"use client"

import { useEffect, useMemo, useState } from "react"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { BOUNTY_MANAGER_CONTRACT } from "@/lib/contract-config"
import { Header } from "@/components/header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminPage() {
  const { address: wallet } = useAccount()
  const [mounted, setMounted] = useState(false)

  // Reads
  const { data: owner } = useReadContract({
    ...BOUNTY_MANAGER_CONTRACT,
    functionName: 'owner',
  })
  const { data: feeCollector } = useReadContract({
    ...BOUNTY_MANAGER_CONTRACT,
    functionName: 'feeCollector',
  })
  const { data: platformFeePercent } = useReadContract({
    ...BOUNTY_MANAGER_CONTRACT,
    functionName: 'platformFeePercent',
  })

  const isOwner = useMemo(() => {
    if (!wallet || !owner) return false
    return wallet.toLowerCase() === (owner as `0x${string}`).toLowerCase()
  }, [wallet, owner])

  // Local form state
  const [newCollector, setNewCollector] = useState<string>("")
  const [newFeeBps, setNewFeeBps] = useState<string>("")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (feeCollector && !newCollector) setNewCollector(feeCollector as string)
    if (platformFeePercent != null && newFeeBps === "") setNewFeeBps(String(platformFeePercent))
  }, [feeCollector, platformFeePercent])

  // Writes
  const { writeContract: write, data: pendingHash, isPending, error: writeError } = useWriteContract()
  const { isLoading: waiting, isSuccess: mined } = useWaitForTransactionReceipt({
    hash: pendingHash,
  })

  const canWrite = isOwner && !!wallet

  const onSetCollector = async () => {
    if (!canWrite) return
    if (!newCollector || !newCollector.startsWith("0x") || newCollector.length !== 42) {
      alert("Enter a valid 0x address for fee collector")
      return
    }
    write({
      ...BOUNTY_MANAGER_CONTRACT,
      functionName: 'setFeeCollector',
      args: [newCollector as `0x${string}`],
    })
  }

  const onSetFee = async () => {
    if (!canWrite) return
    const n = Number(newFeeBps)
    if (!Number.isFinite(n) || n < 0 || n > 1000) {
      alert("Fee must be between 0 and 1000 (bps)")
      return
    }
    write({
      ...BOUNTY_MANAGER_CONTRACT,
      functionName: 'setPlatformFee',
      args: [BigInt(n)],
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        <h1 className="text-2xl font-semibold">Admin Panel</h1>
        <p className="text-muted-foreground">Manage platform fee and fee collector. Connect the owner wallet to make changes.</p>

        {mounted && !wallet && (
          <Alert>
            <AlertDescription>Connect your wallet to continue.</AlertDescription>
          </Alert>
        )}

        {mounted && wallet && !isOwner && (
          <Alert>
            <AlertDescription>
              Connected wallet ({wallet}) is not the owner. Owner: {owner as string}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <h2 className="text-xl font-medium">Current Settings</h2>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">Owner: <span className="font-mono">{owner as string || '—'}</span></div>
            <div className="text-sm">Fee Collector: <span className="font-mono">{feeCollector as string || '—'}</span></div>
            <div className="text-sm">Platform Fee: <span className="font-mono">{platformFeePercent != null ? String(platformFeePercent) + ' bps' : '—'}</span></div>
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <h2 className="text-xl font-medium">Update Fee Collector</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value={newCollector} onChange={(e) => setNewCollector(e.target.value)} placeholder="0x..." />
            <Button onClick={onSetCollector} disabled={!canWrite || isPending || waiting}>
              {isPending || waiting ? 'Updating...' : 'Set Fee Collector'}
            </Button>
            {writeError && <div className="text-destructive text-sm">{String(writeError.message ?? writeError)}</div>}
            {mined && <div className="text-green-600 text-sm">Transaction confirmed.</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-medium">Update Platform Fee (bps)</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value={newFeeBps} onChange={(e) => setNewFeeBps(e.target.value)} placeholder="0 - 1000" />
            <Button onClick={onSetFee} disabled={!canWrite || isPending || waiting}>
              {isPending || waiting ? 'Updating...' : 'Set Platform Fee'}
            </Button>
          </CardContent>
        </Card>

        <Alert>
          <AlertDescription>
            Notes: Fees are collected only when a submission is accepted. They are not retroactive. Max fee is 1000 bps (10%).
          </AlertDescription>
        </Alert>
      </main>
    </div>
  )
}
