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
    icon: "/app-icon.svg",
    shortcut: "/app-icon.svg",
    apple: "/app-icon.svg",
  },
  openGraph: {
    title: "Buggy Bounty - Security Bug Bounty Platform",
    description: "Discover and submit bug bounties on Base blockchain. Earn rewards for finding security vulnerabilities.",
    url: process.env.NEXT_PUBLIC_URL || "https://bug-bounty-mini-app-swib.vercel.app",
    siteName: "Buggy Bounty",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_URL || "https://bug-bounty-mini-app-swib.vercel.app"}/og-image.svg`,
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
    images: [`${process.env.NEXT_PUBLIC_URL || "https://bug-bounty-mini-app-swib.vercel.app"}/og-image.svg`],
  },
  // Farcaster Frame metadata
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": `${process.env.NEXT_PUBLIC_URL || "https://bug-bounty-mini-app-swib.vercel.app"}/api/frame/image?page=home`,
    "fc:frame:button:1": "View Bounties",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": `${process.env.NEXT_PUBLIC_URL || "https://bug-bounty-mini-app-swib.vercel.app"}/`,
    "fc:frame:button:2": "Create Bounty",
    "fc:frame:button:2:action": "link",
    "fc:frame:button:2:target": `${process.env.NEXT_PUBLIC_URL || "https://bug-bounty-mini-app-swib.vercel.app"}/#create`,
    "fc:frame:button:3": "Admin",
    "fc:frame:button:3:action": "link",
    "fc:frame:button:3:target": `${process.env.NEXT_PUBLIC_URL || "https://bug-bounty-mini-app-swib.vercel.app"}/admin`,
    "fc:frame:post_url": `${process.env.NEXT_PUBLIC_URL || "https://bug-bounty-mini-app-swib.vercel.app"}/api/frame`,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
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
