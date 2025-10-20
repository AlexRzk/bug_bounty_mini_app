"use client"

import dynamic from "next/dynamic"
import { Header } from "@/components/header"
import { useEffect, useState } from "react"
import { isMiniAppContext } from "@/lib/miniapp-detection"

// Load BountyBoardMagic only on client side to prevent SSR hydration issues
const BountyBoardMagic = dynamic(
  () => import("@/components/bounty-board-magic").then(mod => ({ default: mod.BountyBoardMagic })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Loading bounties...</p>
        </div>
      </div>
    )
  }
)

export default function Home() {
  const [isMiniApp, setIsMiniApp] = useState(false)

  useEffect(() => {
    // Detect if running in Mini App context
    setIsMiniApp(isMiniAppContext())
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Show header in web mode, hide in Mini App mode for cleaner UI */}
      {!isMiniApp && <Header />}
      <main className="container mx-auto px-4 py-8">
        <BountyBoardMagic />
      </main>
    </div>
  )
}
