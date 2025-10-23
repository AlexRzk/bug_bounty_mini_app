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
    severity: "0", // 0=Low, 1=Medium, 2=High, 3=Critical
    deadline: "7", // Days from now
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
        severity: "0",
        deadline: "7",
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

    if (!formData.title.trim() || !formData.description.trim() || !formData.reward || !formData.severity || !formData.deadline) {
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
    const deadlineDays = parseInt(formData.deadline, 10)
    if (isNaN(deadlineDays) || deadlineDays < 1 || deadlineDays > 365) {
      toast({
        title: "Invalid deadline",
        description: "Please enter a deadline between 1 and 365 days.",
        variant: "destructive",
      })
      return
    }

    try {
      // Calculate deadline timestamp (days from now)
      const deadlineSeconds = Math.floor(Date.now() / 1000) + (deadlineDays * 24 * 60 * 60)
      
      writeContract({
        ...BOUNTY_MANAGER_CONTRACT,
        functionName: 'createBounty',
        args: [
          formData.title,
          formData.description,
          Number(formData.severity), // 0=Low, 1=Medium, 2=High, 3=Critical
          deadlineSeconds, // deadline as unix timestamp
          "0x0000000000000000000000000000000000000000", // _creator (0x0 means use msg.sender)
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
                  <SelectItem value="3">Critical</SelectItem>
                  <SelectItem value="2">High</SelectItem>
                  <SelectItem value="1">Medium</SelectItem>
                  <SelectItem value="0">Low</SelectItem>
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
            <Label htmlFor="deadline">Deadline (Days from now)</Label>
            <Input
              id="deadline"
              type="number"
              min="1"
              max="365"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground">Researchers will have this many days to submit solutions</p>
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
