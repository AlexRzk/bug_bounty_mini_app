/**
 * Frame endpoint for Farcaster Mini App
 * Handles frame POST requests and returns updated frame state
 * Route: POST /api/frame
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Extract frame context from Farcaster
    const { untrustedData } = body
    const fid = untrustedData?.fid // Farcaster ID
    const buttonIndex = untrustedData?.buttonIndex // Clicked button (1-indexed)
    const inputText = untrustedData?.inputText // Text input from user
    const castId = untrustedData?.castId // Original cast
    const network = untrustedData?.network // Network info

    console.log('Frame interaction:', { fid, buttonIndex, inputText, castId, network })

    // Handle different button clicks
    if (buttonIndex === 1) {
      // "View Bounties" button
      return NextResponse.json({
        version: 'vNext',
        image: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/frame/image?page=bounties`,
        buttons: [
          {
            label: 'View Details',
            action: 'post',
            target: `${process.env.NEXT_PUBLIC_URL}/api/frame?action=details`,
          },
          {
            label: 'Go Home',
            action: 'post',
            target: `${process.env.NEXT_PUBLIC_URL}/api/frame?action=home`,
          },
        ],
        state: JSON.stringify({ page: 'bounties', fid }),
      })
    }

    if (buttonIndex === 2) {
      // "Create Bounty" button
      return NextResponse.json({
        version: 'vNext',
        image: `${process.env.NEXT_PUBLIC_URL}/api/frame/image?page=create`,
        buttons: [
          {
            label: 'Launch App',
            action: 'link',
            target: `${process.env.NEXT_PUBLIC_URL}/#create`,
          },
        ],
      })
    }

    // Default: return home frame
    return NextResponse.json({
      version: 'vNext',
      image: `${process.env.NEXT_PUBLIC_URL}/api/frame/image?page=home`,
      buttons: [
        {
          label: 'View Bounties',
          action: 'post',
          target: `${process.env.NEXT_PUBLIC_URL}/api/frame?action=bounties`,
        },
        {
          label: 'Create Bounty',
          action: 'link',
          target: `${process.env.NEXT_PUBLIC_URL}/#create`,
        },
        {
          label: 'Admin',
          action: 'link',
          target: `${process.env.NEXT_PUBLIC_URL}/admin`,
        },
      ],
      post_url: `${process.env.NEXT_PUBLIC_URL}/api/frame`,
      state: JSON.stringify({ page: 'home', fid }),
    })
  } catch (error) {
    console.error('Frame error:', error)
    return NextResponse.json({ error: 'Frame processing failed' }, { status: 400 })
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const page = searchParams.get('page') || 'home'

  // Return frame metadata for GET requests
  return NextResponse.json({
    version: 'vNext',
    image: `${process.env.NEXT_PUBLIC_URL}/api/frame/image?page=${page}`,
    buttons: [
      {
        label: 'View Bounties',
        action: 'link',
        target: `${process.env.NEXT_PUBLIC_URL}/`,
      },
      {
        label: 'Create Bounty',
        action: 'link',
        target: `${process.env.NEXT_PUBLIC_URL}/#create`,
      },
    ],
  })
}
