# 🚀 PAY402 - x402 Protocol Meme Token Launchpad

## 🎯 Overview

**PAY402** is the first meme token launchpad using the revolutionary **x402 Payment Protocol** (HTTP 402). Pay with USDC and instantly mint meme tokens on Base - no accounts, no subscriptions, just pure web3 payments!

## ⚡ Features

- 💰 **Pay-to-Mint**: Send USDC → Get PAY402 tokens instantly
- 🌐 **HTTP 402 Native**: First-class x402 protocol implementation
- ⚡ **Lightning Fast**: Base-powered for low fees (~$0.01 per mint)
- 🎨 **Modern UI**: Beautiful, mobile-responsive interface
- 🤖 **AI Agent Compatible**: M2M payments supported
- 🔒 **Secure**: Facilitator-verified payments

## 🏗️ Architecture

```
┌──────────────┐      HTTP 402       ┌──────────────┐
│   Frontend   │ ◄─────────────────► │   Backend    │
│  (Next.js)   │   X-PAYMENT Header  │  (Node.js)   │
└──────────────┘                     └──────┬───────┘
                                            │
                                            │ Verify
                                            ▼
                                     ┌─────────────┐
                                     │ Facilitator │
                                     │   (CDP)     │
                                     └──────┬──────┘
                                            │
                                            │ Settle
                                            ▼
                                     ┌─────────────┐
                                     │    Base     │
                                     │  (Solidity) │
                                     └─────────────┘
```

## 📦 Project Structure

```
x402/
├── contracts/          # Solidity smart contracts
│   ├── contracts/
│   │   ├── PAY402Token.sol
│   │   └── X402Facilitator.sol
│   ├── scripts/deploy.js
│   └── hardhat.config.js
├── backend/           # Node.js x402 API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── mint.ts
│   │   │   └── stats.ts
│   │   ├── services/
│   │   │   ├── blockchain.ts
│   │   │   └── payment.ts
│   │   └── index.ts
│   └── package.json
├── frontend/          # Next.js UI
│   ├── app/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── MintCard.tsx
│   │   └── Stats.tsx
│   ├── lib/
│   │   ├── wallet.ts
│   │   └── api.ts
│   └── package.json
└── README.md
```

## 🎮 How It Works

### User Flow

1. **Connect Wallet** → User connects MetaMask
2. **Select Amount** → Choose how many tokens to mint
3. **Pay with x402** → Backend returns 402 Payment Required
4. **Payment Made** → User sends USDC onchain (Base network)
5. **Auto-Verify** → Backend verifies payment on Base
6. **Mint Tokens** → Smart contract mints tokens to user
7. **Success!** → Tokens appear in wallet

### Technical Flow

```typescript
// 1. Client requests mint
GET /api/mint?amount=10000

// 2. Server responds with 402
{
  "status": 402,
  "payment": {
    "amount": "1.0",
    "currency": "USDC",
    "chain": "base",
    "payTo": "0x...",
    "reason": "Mint 10,000 PAY402 tokens"
  }
}

// 3. Client pays and includes transaction hash
POST /api/mint
Headers: { "X-PAYMENT": "0x123..." }
Body: { "amount": 10000, "userAddress": "0xabc..." }

// 4. Server verifies and settles
// Returns 200 OK with X-PAYMENT-RESPONSE header
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, TypeScript, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express, TypeScript
- **Smart Contracts**: Solidity 0.8.24, Hardhat, OpenZeppelin
- **Payment Protocol**: x402 (HTTP 402)
- **Blockchain**: Base Mainnet (Ethereum L2)
- **Wallet**: ethers.js v6 (MetaMask compatible)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MetaMask Wallet
- ETH on Base (for gas)
- USDC on Base

### Installation

```bash
# Navigate to project
cd x402

# Install all dependencies (monorepo)
npm install -ws

# Quick start development
npm run dev:backend    # Terminal 1
npm run dev:frontend   # Terminal 2

# First time? Deploy contracts first:
cd contracts && npm run deploy:sepolia
```

📖 **Detailed guides:**
- [QUICKSTART.md](./QUICKSTART.md) - Get running in 5 minutes
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment guide

### Environment Variables

Create `.env` files (see `.env.example` in each directory):

**contracts/.env**
```env
PRIVATE_KEY=0x...
BASE_RPC_URL=https://mainnet.base.org
BASESCAN_API_KEY=your_api_key
```

**backend/.env**
```env
BASE_RPC_URL=https://mainnet.base.org
PRIVATE_KEY=0x...
PUMP_TOKEN_ADDRESS=0x...
FACILITATOR_ADDRESS=0x...
USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
```

**frontend/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CHAIN_ID=8453
```

### Run Development

```bash
# Method 1: Individual terminals
cd backend && npm run dev    # Terminal 1: http://localhost:3001
cd frontend && npm run dev   # Terminal 2: http://localhost:3000

# Method 2: Monorepo scripts
npm run dev:backend          # Terminal 1
npm run dev:frontend         # Terminal 2
```

Visit `http://localhost:3000` 🎉

## 📝 Smart Contract Details

### PUMP Token

- **Name**: PUMP Token
- **Symbol**: PUMP
- **Decimals**: 18
- **Max Supply**: 1,000,000,000 PUMP
- **Price**: 1 USDC = 10,000 PUMP

### Key Functions

```solidity
// Mint tokens for user after x402 payment verification
function mintForUser(address user, uint256 usdcAmount, bytes32 txHash) external

// Set trusted minter (owner only)
function setTrustedMinter(address _minter) external onlyOwner

// Process payment and mint (Facilitator contract)
function processPayment(address user, uint256 usdcAmount, bytes32 txHash) external onlyOwner
```

## 🔐 Security Features

- ✅ Facilitator-verified payments
- ✅ Double-spend prevention (tx hash tracking)
- ✅ Amount validation
- ✅ Expiry checking
- ✅ Chain verification
- ✅ Trusted minter pattern

## 📊 API Endpoints

### GET /api/mint
Returns 402 Payment Required with payment details

### POST /api/mint
**Headers**: `X-PAYMENT: <tx_hash>`
**Body**: `{ amount, userAddress }`
**Response**: 200 OK with X-PAYMENT-RESPONSE header

### GET /api/stats
Returns token statistics (total minted, holders, etc.)

## 🎨 UI Features

- 🌙 Dark mode by default
- 📱 Mobile-responsive
- ⚡ Real-time updates
- 🎯 Animated stats
- 🔔 Toast notifications
- 💫 Smooth transitions

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete production deployment guide.

**Quick deploy options:**
- **Contracts**: Base Mainnet (deploy with Hardhat)
- **Backend**: Railway, Render, or DigitalOcean
- **Frontend**: Vercel (recommended), Netlify, or Cloudflare Pages

## 📄 License

MIT License - Build whatever you want!

## 🤝 Contributing

PRs welcome! This is the future of web payments.

## 🐦 Social

- Twitter: @pump402
- Discord: discord.gg/pump402
- Telegram: t.me/pump402

---

**Built with x402 Protocol** 🚀 | **Powered by Base** ⚡

# Force Railway redeploy
