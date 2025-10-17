/**
 * Frame image generation endpoint
 * Generates OG images for Farcaster frames dynamically
 * Route: GET /api/frame/image?page=home|bounties|create
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const page = searchParams.get('page') || 'home'

  // Generate SVG image based on page
  const svg = generateFrameImage(page)

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=300',
    },
  })
}

function generateFrameImage(page: string): string {
  const width = 1200
  const height = 630

  let title = 'BountyBuggy'
  let subtitle = 'Security Bounties on Base'
  let color = '#0052FF' // Base blue

  switch (page) {
    case 'bounties':
      title = 'Active Bounties'
      subtitle = 'Browse security bugs and earn rewards'
      color = '#00D4AA'
      break
    case 'create':
      title = 'Create Bounty'
      subtitle = 'Launch a new security bounty'
      color = '#FF6B35'
      break
    case 'home':
    default:
      title = 'BountyBuggy'
      subtitle = 'Secure, Fast, Rewarding'
      color = '#0052FF'
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#16213e;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#grad)" />

  <!-- Accent bar -->
  <rect width="${width}" height="8" fill="${color}" />

  <!-- Title -->
  <text x="${width / 2}" y="180" font-size="72" font-weight="bold" text-anchor="middle" fill="white" font-family="Arial, sans-serif">
    ${title}
  </text>

  <!-- Subtitle -->
  <text x="${width / 2}" y="280" font-size="40" text-anchor="middle" fill="#CCCCCC" font-family="Arial, sans-serif">
    ${subtitle}
  </text>

  <!-- Base logo -->
  <circle cx="150" cy="80" r="40" fill="${color}" />
  <text x="150" y="95" font-size="48" font-weight="bold" text-anchor="middle" fill="white" font-family="Arial, sans-serif">
    ⟠
  </text>

  <!-- Footer -->
  <text x="${width / 2}" y="${height - 40}" font-size="24" text-anchor="middle" fill="#666666" font-family="Arial, sans-serif">
    Powered by Base & Farcaster
  </text>

  <!-- Bug icon -->
  <circle cx="${width - 100}" cy="80" r="35" fill="rgba(${color === '#0052FF' ? '0,82,255' : color === '#00D4AA' ? '0,212,170' : '255,107,53'},0.2)" />
  <text x="${width - 100}" y="95" font-size="40" text-anchor="middle" fill="${color}" font-family="Arial, sans-serif">
    🐛
  </text>
</svg>
  `.trim()
}
