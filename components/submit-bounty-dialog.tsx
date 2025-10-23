"use client"

import React, { useState } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from "wagmi"
import { parseEther } from "viem"
import { base } from "wagmi/chains"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { BOUNTY_MANAGER_CONTRACT } from "@/lib/contract-config"
import "@/components/glowing-button.css"

export function SubmitBountyDialog() {
  const { isConnected, chain } = useAccount()
  const { toast } = useToast()
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  const { switchChain } = useSwitchChain()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reward: "",
    severity: "",
    deadline: "",
    farcasterCastHash: "",
  })

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Close dialog and reset form after successful submission
  React.useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Bounty created!",
        description: "Your bug bounty has been posted on-chain.",
      })
      setOpen(false)
      setFormData({
        title: "",
        description: "",
        reward: "",
        severity: "",
        deadline: "",
        farcasterCastHash: "",
      })
    }
  }, [isSuccess, toast])

  // Show error toast
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Creation failed",
        description: error.message || "Failed to create bounty. Please try again.",
        variant: "destructive",
      })
    }
  }, [error, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to submit a bounty.",
        variant: "destructive",
      })
      return
    }

    // Check if on the correct chain
    if (chain?.id !== base.id) {
      toast({
        title: "Wrong network",
        description: "Switching to Base mainnet...",
      })
      
      try {
        await switchChain?.({ chainId: base.id })
      } catch (err) {
        toast({
          title: "Network switch failed",
          description: "Please manually switch to Base Sepolia in your wallet.",
          variant: "destructive",
        })
        return
      }
    }

    if (!formData.title.trim() || !formData.description.trim() || !formData.reward) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    // Validate reward amount
    const rewardAmount = parseFloat(formData.reward)
    if (isNaN(rewardAmount) || rewardAmount <= 0) {
      toast({
        title: "Invalid reward",
        description: "Please enter a valid reward amount greater than 0.",
        variant: "destructive",
      })
      return
    }

    // Validate deadline
    if (!formData.deadline) {
      toast({
        title: "Invalid deadline",
        description: "Please select a deadline date.",
        variant: "destructive",
      })
      return
    }

    // Calculate deadline timestamp.
    // The UI uses a date input (YYYY-MM-DD). Set deadline to end-of-day local time.
    let deadlineTimestamp: bigint
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (dateRegex.test(formData.deadline)) {
      const [year, month, day] = formData.deadline.split('-').map(Number)
      // Create date at end of day (23:59:59) in local timezone
      const selected = new Date(year, month - 1, day, 23, 59, 59)
      if (isNaN(selected.getTime())) {
        toast({
          title: "Invalid date format",
          description: "Please enter a valid deadline date.",
          variant: "destructive",
        })
        return
      }
      
      // Check if deadline is in the past
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const selectedDate = new Date(year, month - 1, day)
      
      if (selectedDate < today) {
        toast({
          title: "Invalid deadline",
          description: "The deadline must be today or in the future.",
          variant: "destructive",
        })
        return
      }
      
      // Convert milliseconds to seconds for Unix timestamp
      deadlineTimestamp = BigInt(Math.floor(selected.getTime() / 1000))
    } else {
      const daysFromNow = parseInt(formData.deadline) || 7
      deadlineTimestamp = BigInt(Math.floor(Date.now() / 1000) + daysFromNow * 86400)
    }

    try {
      writeContract({
        ...BOUNTY_MANAGER_CONTRACT,
        functionName: 'createBountyETH',
        args: [
          formData.title,
          formData.description,
          deadlineTimestamp,
          formData.farcasterCastHash || "",
        ],
        value: parseEther(formData.reward),
      })
    } catch (err) {
      console.error("Failed to create bounty:", err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="glowing-button">
          <Plus className="inline h-4 w-4 mr-2" />
          Submit Bounty
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Submit a Bug Bounty</DialogTitle>
          <DialogDescription>Create a new bug bounty for the community to discover and solve.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Bounty Title</Label>
            <Input
              id="title"
              placeholder="e.g., Critical Smart Contract Vulnerability"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the vulnerability or issue you want researchers to find..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="severity">Severity Level</Label>
              <Select
                value={formData.severity}
                onValueChange={(value) => setFormData({ ...formData, severity: value })}
                required
              >
                <SelectTrigger id="severity">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reward">Reward (ETH)</Label>
              <Input
                id="reward"
                type="number"
                step="0.01"
                placeholder="e.g., 2.5"
                value={formData.reward}
                onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              required
            />
            <p className="text-xs text-muted-foreground">Select today or any future date</p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || isConfirming || !isConnected}>
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isPending ? "Confirming..." : "Submitting..."}
                </>
              ) : (
                "Submit Bounty"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
