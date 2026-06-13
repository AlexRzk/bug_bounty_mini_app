# Bug Bounty Mini App

A Farcaster-compatible mini app for creating, browsing and resolving bug bounties on Base.

Live app: https://bug-bounty-mini-app-swib.vercel.app

Bug Bounty Mini App is a compact bug bounty platform built for the Farcaster ecosystem. The idea is simple: project owners can publish a bounty with an ETH reward, security researchers can submit reports, and the bounty lifecycle is handled through a smart contract deployed on Base.

This project was developed with a hackathon mindset, with the goal of competing seriously in a Base hackathon. Instead of trying to recreate a full enterprise bug bounty platform, the focus is on a smaller and more direct experience: a mini app that can live inside the social flow of Farcaster while still using real on-chain logic.

## Why this project exists

Most bug bounty platforms are heavy, centralized and separated from the communities where builders already communicate. This project explores a lighter version of that experience.

The goal was to make bug bounties feel closer to the Base and Farcaster ecosystem:

- A project can launch a bounty quickly.
- A researcher can discover and submit a report from a Farcaster-compatible client.
- Rewards are escrowed on-chain instead of being handled manually.
- The bounty history stays transparent through the Base network.

The result is not meant to replace large security platforms such as HackerOne or Immunefi. It is a mini-app prototype focused on speed, clarity and on-chain experimentation.

## What the app does

The application displays active bug bounties from the BountyManagerV3 smart contract. Each bounty contains a title, a description, a reward in ETH, a severity level, a deadline and a current status.

From the app, users can:

- Browse active bounties.
- Filter bounties by severity: low, medium, high and critical.
- Sort bounties by reward, date or severity.
- Open a dedicated page for each bounty.
- Create a new bounty by locking an ETH reward in the contract.
- Submit a vulnerability report to an existing bounty.
- Add an optional evidence or resolution link, for example a GitHub proof of concept.
- Let the bounty creator review private submissions.
- Accept a submission and pay the selected researcher.
- Trigger dispute logic if the creator does not choose a winner in time.

There is also a demo boost interaction on bounty cards. It is currently a front-end feature used to demonstrate how paid visibility could work in a future version.

## Farcaster mini app support

The project is designed to work both as a normal web app and as a Farcaster mini app.

The app includes Farcaster mini app metadata in the Next.js layout and initializes the Farcaster Mini App SDK at the root of the application. When opened inside a Farcaster-compatible environment, the app calls the SDK ready action so the mini app can be displayed properly after loading.

The interface also adapts when it detects a mini app context. Detection is based on several signals, including query parameters, iframe usage, Farcaster or Warpcast referrers, and narrow mobile-style viewports.

In practice, this means the same codebase can be used as:

- a public web app hosted on Vercel;
- a Farcaster-compatible mini app;
- a mobile-first interface for users opening it from a social feed.

## How the on-chain flow works

The smart contract used by the app is `BountyManagerV3`, deployed on Base mainnet.

Contract address:

```text
0x3165e828EB446b69DeB1Ebbc074539C57Cb49958
```

The contract handles the core bounty lifecycle:

1. A creator opens a bounty and sends ETH as the reward.
2. The bounty is stored with a title, description, severity and deadline.
3. A researcher submits a response to the bounty.
4. The first response locks the bounty and starts a selection period.
5. The creator can accept one response and complete the bounty.
6. The contract pays the winner and sends the platform fee to the fee collector.
7. If the creator does not select a winner before the selection deadline, the bounty can be disputed.
8. In a disputed bounty, responders can claim compensation from the escrowed funds.

This V3 version adds escrow and time-lock mechanics to avoid a simple problem: a creator should not be able to collect useful vulnerability reports and then disappear without selecting a winner.

## Main features

### Bounty board

The home page loads bounty data from the contract and renders it as an interactive board. Each card shows the bounty status, severity, reward, deadline and creator address.

The board supports:

- severity filtering;
- sorting by reward, deadline or severity;
- animated cards and hover effects;
- a mobile-friendly layout for mini app usage.

### Bounty creation

Project owners can create a bounty from the app. The form asks for:

- title;
- description;
- reward in ETH;
- severity level;
- deadline in days.

Before creating the bounty, the app checks that the wallet is connected, verifies that the user is on the correct Base network, validates the form fields and sends the transaction to the contract.

### Report submission

Researchers can submit a report from a bounty detail page. A report can contain the vulnerability explanation, reproduction steps, impact and suggested fixes. An optional evidence URL can also be attached.

The app stores the report content through the contract. The current implementation keeps submissions private for normal users and only shows the full submission details to the bounty creator before acceptance.

### Winner selection and payment

The bounty creator can review submissions and accept one of them. When a response is accepted, the contract marks the bounty as completed and sends the payout to the selected researcher.

The contract also supports a platform fee. In the current V3 contract, the fee is set in basis points and the remaining amount is paid to the winner.

### Dispute and compensation logic

If a bounty is locked after receiving a response and the creator does not select a winner within the selection period, the bounty can move into a disputed state.

In that case, eligible responders can claim a compensation share. This keeps the prototype more balanced and shows how a small amount of dispute protection can be added directly at contract level.

## Tech stack

### Frontend

- Next.js 15 with the App Router
- React 19
- TypeScript
- Tailwind CSS
- Radix UI and shadcn-style components
- Framer Motion and GSAP for interface animations
- Vercel Analytics

### Web3 and mini app layer

- Farcaster Mini App SDK
- Wagmi
- Viem
- WalletConnect
- Coinbase OnchainKit
- Base mainnet
- Base Sepolia support through environment configuration

### Smart contracts

- Solidity 0.8.20
- Foundry project structure
- OpenZeppelin Ownable
- OpenZeppelin ReentrancyGuard
- Bounty escrow
- Selection deadline
- Dispute and compensation flow

## Project structure

```text
app/
  api/                  API routes and Farcaster-related endpoints
  bounty/[id]/           Bounty detail page
  layout.tsx             Metadata, Farcaster mini app tags and providers
  page.tsx               Main bounty board page

components/
  bounty-board-magic.tsx Main bounty board UI
  bounty-detail.tsx      Single bounty page
  submit-bounty-dialog.tsx
  submit-response-dialog.tsx
  response-list.tsx
  frame-initializer.tsx  Farcaster Mini App SDK initialization
  ui/                    Shared UI components

contracts/
  src/                   Solidity contracts
  script/                Deployment scripts
  test/                  Contract tests

lib/
  contract-config.ts     Contract addresses and ABIs
  wagmi-config.ts        Wallet and Base network configuration
  miniapp-detection.ts   Mini app context detection helpers
  bounty-v3-utils.ts     Status and compensation helpers
```

## Getting started locally

### Prerequisites

You need:

- Node.js 18 or newer;
- npm or pnpm;
- a wallet compatible with Base;
- a WalletConnect project ID if you want your own production wallet configuration.

### Installation

Clone the repository:

```bash
git clone https://github.com/AlexRzk/bug_bounty_mini_app.git
cd bug_bounty_mini_app
```

Install dependencies:

```bash
npm install
```

Or with pnpm:

```bash
pnpm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_USE_TESTNET=false
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

For production, use the deployed URL:

```env
NEXT_PUBLIC_URL=https://bug-bounty-mini-app-swib.vercel.app
NEXT_PUBLIC_USE_TESTNET=false
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

Run the development server:

```bash
npm run dev
```

Or with pnpm:

```bash
pnpm dev
```

Then open:

```text
http://localhost:3000
```

## Testing as a Farcaster mini app

To test the app in a Farcaster-compatible environment, the app needs to be available through a public HTTPS URL.

A typical flow is:

1. Deploy the app on Vercel or another HTTPS host.
2. Set `NEXT_PUBLIC_URL` to the production URL.
3. Make sure the Farcaster mini app metadata points to the same URL.
4. Open the app from a compatible Farcaster client.
5. Connect a wallet on Base and test the bounty flow.

The current production URL is:

```text
https://bug-bounty-mini-app-swib.vercel.app
```

## Smart contract notes

The frontend currently uses `BountyManagerV3` as the default contract.

The contract includes:

- bounty creation with ETH reward escrow;
- response submission;
- automatic bounty locking after the first response;
- a selection period for the creator;
- bounty completion and winner payout;
- platform fee support;
- dispute activation after the selection deadline;
- compensation claiming for responders in disputed bounties.

The contract code is available in:

```text
contracts/src/BountyManagerV3.sol
```

## Current limitations

This is a hackathon-oriented mini app, so a few parts are intentionally lightweight:

- The boost feature is currently a demo interaction and is not paid on-chain yet.
- Reports are stored through the contract, so sensitive production disclosures would need a stronger privacy model before real-world use.
- The UI currently focuses on the core bounty flow rather than a full admin dashboard.
- The project is a prototype and should be reviewed carefully before being used with meaningful funds.

## Useful links

- Live app: https://bug-bounty-mini-app-swib.vercel.app
- Repository: https://github.com/AlexRzk/bug_bounty_mini_app
- Contract on BaseScan: https://basescan.org/address/0x3165e828EB446b69DeB1Ebbc074539C57Cb49958
- Base: https://base.org
- Farcaster: https://farcaster.xyz

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
