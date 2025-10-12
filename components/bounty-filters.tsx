"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BountyFiltersProps {
  currentFilter: string
  onFilterChange: (filter: string) => void
  currentSort: string
  onSortChange: (sort: string) => void
}

export function BountyFilters({ currentFilter, onFilterChange, currentSort, onSortChange }: BountyFiltersProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={currentFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange("all")}
        >
          All Bounties
        </Button>
        <Button
          variant={currentFilter === "critical" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange("critical")}
        >
          Critical
        </Button>
        <Button
          variant={currentFilter === "high" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange("high")}
        >
          High
        </Button>
        <Button
          variant={currentFilter === "low" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange("low")}
        >
          Low
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Sort by:</span>
        <Select value={currentSort} onValueChange={onSortChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="reward">Highest Reward</SelectItem>
            <SelectItem value="deadline">Deadline</SelectItem>
            <SelectItem value="responses">Most Responses</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
