# Bug Bounty Mini App

This repository contains a Farcaster Mini App that showcases live bounty programs and lets researchers submit findings without leaving the Farcaster client. It is built with Next.js 15, the Farcaster Mini Kit, Wagmi, and the Base network.

## What It Does
- Lists open bounties pulled from the on-chain `BountyManager` contract.
- Lets authenticated Farcaster users review details, filter by reward type, and launch external bounty pages.
- Provides a streamlined submission dialog that routes responses back to the bounty managers.
- Supports both frame and full mini-app surfaces with consistent theming.

## Tech Highlights
- **Framework:** Next.js App Router with React Server Components.
- **Blockchain:** Base mainnet via Wagmi + Viem for RPC interactions.
- **Mini App SDK:** Farcaster Mini Kit to handle initialization, frame lifecycle, and user session data.
- **Styling:** Tailwind CSS utilities with custom UI components.

## Local Development
1. Install dependencies with `pnpm install`.
2. Copy `.env.example` to `.env.local` and set the required API keys and RPC endpoint.
3. Run `pnpm dev` to start the development server.
4. Open the provided tunnel URL in Warpcast (or the Farcaster client of choice) to load the mini app.

## Deployment Notes
- Ensure `minikit.config.ts` and `farcaster.json` reflect the correct production URLs before shipping.
- When deploying to Vercel, set the same environment variables used locally and redeploy the frame configuration if URLs change.
