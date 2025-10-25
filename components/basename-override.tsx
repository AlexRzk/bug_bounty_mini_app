"use client"

import { useState } from "react"
import { useAccount } from "wagmi"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, Check, X } from "lucide-react"

export function BasenameOverride() {
  const { address } = useAccount()
  const [basename, setBasename] = useState("")
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [currentOverride, setCurrentOverride] = useState<string | null>(null)

  const handleSet = () => {
    if (!address || !basename) {
      setStatus("error")
      return
    }

    try {
      localStorage.setItem(`basename:${address.toLowerCase()}`, basename)
      setCurrentOverride(basename)
      setStatus("success")
      // Reload page to apply changes
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      setStatus("error")
    }
  }

  const handleClear = () => {
    if (!address) return
    localStorage.removeItem(`basename:${address.toLowerCase()}`)
    setCurrentOverride(null)
    setBasename("")
    setStatus("idle")
    setTimeout(() => window.location.reload(), 500)
  }

  if (!address) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Connect your wallet first to set a basename override.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-yellow-500" />
          Basename Override (Temporary)
        </CardTitle>
        <CardDescription>
          If your basename isn't resolving automatically, you can manually set it here.
          This is stored locally and will be used until on-chain resolution works.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="yourname.base.eth"
            value={basename}
            onChange={(e) => setBasename(e.target.value)}
          />
          <Button onClick={handleSet}>Set</Button>
          {currentOverride && (
            <Button onClick={handleClear} variant="outline">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {status === "success" && (
          <Alert className="bg-green-500/10 border-green-500/20">
            <Check className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-500">
              Basename set! Refreshing page...
            </AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert className="bg-red-500/10 border-red-500/20">
            <X className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-500">
              Failed to set basename. Please check your input.
            </AlertDescription>
          </Alert>
        )}

        {currentOverride && (
          <Alert className="bg-blue-500/10 border-blue-500/20">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-500">
              Current override: <strong>{currentOverride}</strong>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Why is this needed?</strong></p>
          <ul className="list-disc ml-4 space-y-1">
            <li>Your basename registration might still be processing</li>
            <li>The reverse record (address → name) needs to be set up</li>
            <li>You can set it manually at: <a href="https://www.base.org/names" target="_blank" rel="noopener" className="text-primary hover:underline">base.org/names</a></li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
