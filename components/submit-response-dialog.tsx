"use client"

import React, { useState } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from "wagmi"
import { baseSepolia } from "wagmi/chains"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Send, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { BOUNTY_MANAGER_CONTRACT } from "@/lib/contract-config"

interface SubmitResponseDialogProps {
  bountyId: string
}

export function SubmitResponseDialog({ bountyId }: SubmitResponseDialogProps) {
  const { isConnected, chain } = useAccount()
  const { toast } = useToast()
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  const { switchChain } = useSwitchChain()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    report: "",
    evidenceUrl: "",
  })

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Close dialog and reset form after successful submission
  React.useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Response submitted!",
        description: "Your vulnerability report has been submitted on-chain.",
      })
      setOpen(false)
      setFormData({
        report: "",
        evidenceUrl: "",
      })
    }
  }, [isSuccess, toast])

  // Show error toast
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit report. Please try again.",
        variant: "destructive",
      })
    }
  }, [error, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to submit a response.",
        variant: "destructive",
      })
      return
    }

    // Check if on the correct chain
    if (chain?.id !== baseSepolia.id) {
      toast({
        title: "Wrong network",
        description: "Switching to Base Sepolia...",
      })
      
      try {
        await switchChain?.({ chainId: baseSepolia.id })
      } catch (err) {
        toast({
          title: "Network switch failed",
          description: "Please manually switch to Base Sepolia in your wallet.",
          variant: "destructive",
        })
        return
      }
    }

    if (!formData.report.trim()) {
      toast({
        title: "Report required",
        description: "Please provide a detailed report of your findings.",
        variant: "destructive",
      })
      return
    }

    console.log("Submitting report:", { bountyId, report: formData.report, evidenceUrl: formData.evidenceUrl })

    try {
      writeContract({
        ...BOUNTY_MANAGER_CONTRACT,
        functionName: 'submitReport',
        args: [
          BigInt(bountyId), 
          formData.report, 
          formData.evidenceUrl || "", 
          "" // farcasterUsername - empty for now
        ],
      })
    } catch (err) {
      console.error("Error submitting report:", err)
      toast({
        title: "Submission failed",
        description: "An error occurred. Check console for details.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Send className="h-4 w-4" />
          Submit Response
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Your Findings</DialogTitle>
          <DialogDescription>
            Provide detailed information about the vulnerability you discovered. Be thorough and professional.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report">Vulnerability Report *</Label>
            <Textarea
              id="report"
              placeholder="Provide a detailed report of your findings, including summary, reproduction steps, impact, and recommended fixes..."
              value={formData.report}
              onChange={(e) => setFormData({ ...formData, report: e.target.value })}
              rows={8}
              required
            />
            <p className="text-xs text-muted-foreground">
              Include: vulnerability description, steps to reproduce, impact assessment, and recommended fixes.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="evidenceUrl">Evidence URL (optional)</Label>
            <Input
              id="evidenceUrl"
              type="url"
              placeholder="https://github.com/your-username/proof-of-concept"
              value={formData.evidenceUrl}
              onChange={(e) => setFormData({ ...formData, evidenceUrl: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Link to proof-of-concept, screenshots, or additional documentation.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending || isConfirming}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || isConfirming || !isConnected}>
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isPending ? "Confirming..." : "Submitting..."}
                </>
              ) : (
                "Submit Response"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
