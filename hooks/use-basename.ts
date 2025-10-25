"use client"

import { useEffect, useState } from "react"
import { Address } from "viem"
import { getBasename, BaseName } from "@/lib/basenames"

export function useBasename(address?: Address) {
  const [basename, setBasename] = useState<BaseName | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!address) return

    let cancelled = false
    const fetchBasename = async () => {
      setIsLoading(true)
      try {
        const name = await getBasename(address)
        if (!cancelled) {
          setBasename(name || null)
        }
      } catch (error) {
        if (!cancelled) setBasename(null)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchBasename()
    return () => {
      cancelled = true
    }
  }, [address])

  return { basename, isLoading }
}

export function formatAddressOrBasename(address?: string, basename?: string | null): string {
  if (basename) return basename
  if (address) return `${address.slice(0, 6)}...${address.slice(-4)}`
  return "Unknown"
}
