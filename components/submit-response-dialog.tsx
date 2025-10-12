"use client"

import type React from "react"

import { useState } from "react"
import { useAccount } from "wagmi"
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
import { Send, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SubmitResponseDialogProps {
  bountyId: string
}

export function SubmitResponseDialog({ bountyId }: SubmitResponseDialogProps) {
  const { isConnected } = useAccount()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    findings: "",
    reproduction: "",
    impact: "",
    recommendation: "",
  })

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

    setIsSubmitting(true)

    // Simulate submission delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    toast({
      title: "Response submitted!",
      description: "Your vulnerability report has been submitted to the bounty creator.",
    })

    setIsSubmitting(false)
    setOpen(false)
    setFormData({
      findings: "",
      reproduction: "",
      impact: "",
      recommendation: "",
    })
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
            <Label htmlFor="findings">Vulnerability Summary</Label>
            <Textarea
              id="findings"
              placeholder="Briefly describe the vulnerability you found..."
              value={formData.findings}
              onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reproduction">Reproduction Steps</Label>
            <Textarea
              id="reproduction"
              placeholder="Provide step-by-step instructions to reproduce the vulnerability..."
              value={formData.reproduction}
              onChange={(e) => setFormData({ ...formData, reproduction: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="impact">Impact Assessment</Label>
            <Textarea
              id="impact"
              placeholder="Explain the potential impact and severity of this vulnerability..."
              value={formData.impact}
              onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommendation">Recommended Fix</Label>
            <Textarea
              id="recommendation"
              placeholder="Suggest how to fix or mitigate this vulnerability..."
              value={formData.recommendation}
              onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !isConnected}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
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
