# 🎯 Bug Bounty Hunter - Farcaster Mini App

A decentralized bug bounty platform built as a Farcaster Mini App, enabling security researchers to discover, submit, and track bug bounties directly from their Farcaster client. All bounties are managed on-chain via smart contracts deployed on Base.

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue)](https://bug-bounty-mini-app.vercel.app)
[![Base Network](https://img.shields.io/badge/Network-Base-0052FF)](https://base.org)
[![Smart Contract](https://img.shields.io/badge/Contract-View%20on%20BaseScan-green)](https://basescan.org/address/0x3165e828EB446b69DeB1Ebbc074539C57Cb49958)

## 🌟 Features

### For Security Researchers
- **Browse Bounties**: Discover active bug bounties with detailed descriptions, severity levels, and rewards
- **Filter & Search**: Sort bounties by severity (Critical, High, Medium, Low) and reward amounts
- **Submit Findings**: Submit vulnerability reports directly through the mini app
- **Track Reputation**: Build your reputation score based on successful submissions
- **Leaderboard**: Compete with other researchers and climb the rankings

### For Project Owners
- **Create Bounties**: Launch bug bounty programs with custom rewards in ETH
- **Set Severity Levels**: Define critical, high, medium, or low severity bounties
- **On-Chain Management**: All bounties are immutable and transparent on Base blockchain
- **Review Submissions**: Evaluate researcher submissions and award bounties

### Platform Highlights
- **Fully Decentralized**: Smart contract-based bounty management
- **Farcaster Native**: Seamless integration with Farcaster wallets and identity
- **Responsive Design**: Optimized for both mobile mini-app and desktop experiences
- **Real-time Updates**: Instant bounty status updates via blockchain events

## 🔗 Smart Contract

**BountyManagerV3** is deployed on Base Mainnet:
- **Contract Address**: [`0x3165e828EB446b69DeB1Ebbc074539C57Cb49958`](https://basescan.org/address/0x3165e828EB446b69DeB1Ebbc074539C57Cb49958)
- **Network**: Base (Chain ID: 8453)
- **Verification**: Verified on BaseScan
- **Source Code**: Available in `/contracts/src/BountyManagerV3.sol`

### Contract Features
- Create and manage bug bounties with ETH rewards
- Submit and track vulnerability reports
- Award bounties to researchers
- Fee collection system (configurable)
- Complete bounty lifecycle management

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS v4
- **Styling**: Custom UI components with shadcn/ui
- **Mini App SDK**: Farcaster MiniKit for authentication and wallet integration

### Blockchain
- **Network**: Base Mainnet & Base Sepolia (testnet)
- **Web3 Libraries**: Wagmi v2, Viem
- **Smart Contracts**: Solidity 0.8.20, Foundry

### Additional Tools
- **Deployment**: Vercel
- **Package Manager**: npm/pnpm
- **Type Safety**: TypeScript

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm
- A Base RPC endpoint (Alchemy, Infura, or public RPC)
- Farcaster account for testing

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AlexRzk/bug_bounty_mini_app.git
   cd bug_bounty_mini_app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Base RPC URL
   NEXT_PUBLIC_BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
   
   # Network Mode (false for mainnet, true for testnet)
   NEXT_PUBLIC_USE_TESTNET=false
   
   # Optional: Analytics, monitoring
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open in Farcaster**
   - Navigate to `http://localhost:3000` in your browser
   - Or use a tunnel (ngrok, localhost.run) to test in Warpcast mobile app

## 📱 Mini App Integration

### Testing in Farcaster
1. Deploy to a public URL (Vercel, Railway, etc.)
2. Update `minikit.config.ts` with your production URL
3. Register your mini app in Farcaster Developer Portal
4. Test in Warpcast or other Farcaster clients

### Frame Support
The app includes Farcaster Frame support for sharing bounties as interactive frames in casts.

## 🏗️ Project Structure

```
├── app/                    # Next.js app router pages
│   ├── api/               # API routes (webhooks, frame handlers)
│   ├── bounty/            # Bounty detail pages
│   ├── leaderboard/       # Researcher leaderboard
│   └── profile/           # User profiles
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── *.tsx             # Feature components
├── contracts/            # Smart contracts (Foundry)
│   ├── src/              # Solidity contracts
│   ├── script/           # Deployment scripts
│   └── test/             # Contract tests
├── lib/                  # Utility functions
│   ├── wagmi-config.ts   # Wagmi configuration
│   ├── contract-config.ts # Contract ABIs and addresses
│   └── utils.ts          # Helper functions
├── hooks/                # Custom React hooks
└── public/               # Static assets
```

## 🔐 Security

- All bounty funds are held in the smart contract escrow
- Only bounty creators can award their bounties
- Smart contract is verified and immutable on Base
- No centralized custody of funds

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live App**: [bug-bounty-mini-app.vercel.app](https://bug-bounty-mini-app.vercel.app)
- **Smart Contract**: [BaseScan](https://basescan.org/address/0x3165e828EB446b69DeB1Ebbc074539C57Cb49958)
- **Base Network**: [base.org](https://base.org)
- **Farcaster**: [farcaster.xyz](https://farcaster.xyz)

## 👨‍💻 Developer

Built with ❤️ for the Base ecosystem and Farcaster community.

---

**Need help?** Open an issue or reach out on Farcaster!