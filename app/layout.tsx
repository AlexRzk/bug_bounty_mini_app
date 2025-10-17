import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Suspense } from "react"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "BountyBuggy - Secure Bug Bounty Platform",
  description: "Discover and submit bug bounties. Secure, fast, and rewarding blockchain-based bug bounty platform.",
  generator: "v0.app",
  openGraph: {
    title: "BountyBuggy - Secure Bug Bounty Platform",
    description: "Discover and submit bug bounties on Base.",
    url: process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
    siteName: "BountyBuggy",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/og-image.png`,
        width: 1200,
        height: 630,
      },
    ],
  },
  // Farcaster Frame metadata
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/api/frame/image?page=home`,
    "fc:frame:button:1": "View Bounties",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/`,
    "fc:frame:button:2": "Create Bounty",
    "fc:frame:button:2:action": "link",
    "fc:frame:button:2:target": `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/#create`,
    "fc:frame:button:3": "Admin",
    "fc:frame:button:3:action": "link",
    "fc:frame:button:3:target": `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/admin`,
    "fc:frame:post_url": `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/api/frame`,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Suspense fallback={<div>Loading...</div>}>
            <Providers>
              {children}
              <Toaster />
            </Providers>
          </Suspense>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
