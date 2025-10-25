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
  title: "Buggy Bounty - Security Bug Bounty Platform",
  description: "Discover and submit bug bounties. Secure, fast, and rewarding blockchain-based bug bounty platform on Base.",
  generator: "Next.js",
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/app-icon.png", sizes: "any" }
    ],
    shortcut: "/favicon.ico",
    apple: "/app-icon.png",
  },
  openGraph: {
    title: "Buggy Bounty - Security Bug Bounty Platform",
    description: "Discover and submit bug bounties on Base blockchain. Earn rewards for finding security vulnerabilities.",
    url: process.env.NEXT_PUBLIC_URL || "https://bug-bounty-mini-app-swib.vercel.app",
    siteName: "Buggy Bounty",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_URL || "https://bug-bounty-mini-app-swib.vercel.app"}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Buggy Bounty Platform",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Buggy Bounty - Security Bug Bounty Platform",
    description: "Discover and submit bug bounties on Base",
    images: [`${process.env.NEXT_PUBLIC_URL || "https://bug-bounty-mini-app-swib.vercel.app"}/og-image.png`],
  },
  // Farcaster Mini App embed metadata
  other: {
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: `${process.env.NEXT_PUBLIC_URL || "https://bug-bounty-mini-app-swib.vercel.app"}/og-image.png`,
      button: {
        title: "Open Bounty Hunter",
        action: {
          type: "launch_frame",
          name: "Bounty Hunter",
          url: process.env.NEXT_PUBLIC_URL || "https://bug-bounty-mini-app-swib.vercel.app",
          splashImageUrl: `${process.env.NEXT_PUBLIC_URL || "https://bug-bounty-mini-app-swib.vercel.app"}/app-icon.png`,
          splashBackgroundColor: "#0a0a0a"
        }
      }
    }),
    // Backward compatibility with fc:frame
    "fc:frame": JSON.stringify({
      version: "1",
      imageUrl: `${process.env.NEXT_PUBLIC_URL || "https://bug-bounty-mini-app-swib.vercel.app"}/og-image.png`,
      button: {
        title: "Open Bounty Hunter",
        action: {
          type: "launch_frame",
          name: "Bounty Hunter",
          url: process.env.NEXT_PUBLIC_URL || "https://bug-bounty-mini-app-swib.vercel.app",
          splashImageUrl: `${process.env.NEXT_PUBLIC_URL || "https://bug-bounty-mini-app-swib.vercel.app"}/app-icon.png`,
          splashBackgroundColor: "#0a0a0a"
        }
      }
    })
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
