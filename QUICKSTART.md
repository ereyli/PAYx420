# ⚡ PUMP402 - Quick Start Guide

Get up and running with PUMP402 in 5 minutes!

## 🎯 Quick Overview

PUMP402 is a meme token launchpad using the x402 Payment Protocol (HTTP 402).

**Flow:** User pays USDC → Backend verifies → Smart contract mints PUMP tokens

## 🚀 Quick Start (Development)

### 1. Install Dependencies

```bash
cd x402

# Install all workspaces
npm install -ws
```

### 2. Start Local Backend

```bash
cd backend

# Copy env file
cp env.example .env

# Add your keys to .env:
# - PRIVATE_KEY
# - PUMP_TOKEN_ADDRESS (after deploying contracts)
# - FACILITATOR_ADDRESS (after deploying contracts)

# Run development server
npm run dev
```

Backend runs on `http://localhost:3001`

### 3. Deploy Smart Contracts (Sepolia Testnet)

```bash
cd contracts

# Copy env file
cp env.example .env

# Add to .env:
# - PRIVATE_KEY (with some Base Sepolia ETH)

# Install and deploy
npm install
npm run deploy:sepolia

# Copy the deployed addresses to backend/.env
```

### 4. Start Frontend

```bash
cd frontend

# Copy env file
cp env.example .env.local

# Add to .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:3001

# Run development server
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

### 5. Test It Out!

1. Open `http://localhost:3000`
2. Click "Connect Wallet"
3. Switch to Base network (MetaMask will prompt)
4. Enter amount of PUMP tokens to mint
5. Click "MINT PUMP TOKENS"
6. Approve USDC payment in MetaMask
7. Wait for mint to complete
8. Check your wallet for PUMP tokens!

## 📖 API Endpoints

### GET /api/mint?amount=10000
Returns 402 Payment Required with payment details

**Response:**
```json
{
  "status": 402,
  "payment": {
    "amount": "1.0",
    "currency": "USDC",
    "chain": "base",
    "payTo": "0x...",
    "reason": "Mint 10,000 PUMP tokens"
  }
}
```

### POST /api/mint
Submit payment and mint tokens

**Headers:**
```
X-PAYMENT: 0xtransaction_hash
```

**Body:**
```json
{
  "userAddress": "0x...",
  "amount": 10000
}
```

**Response:**
```json
{
  "success": true,
  "txHash": "0x...",
  "tokenAmount": "10000",
  "userAddress": "0x...",
  "paymentTxHash": "0x..."
}
```

### GET /api/stats
Get global token statistics

**Response:**
```json
{
  "stats": {
    "totalSupply": "100000000",
    "maxSupply": "1000000000",
    "remainingSupply": "900000000",
    "totalMintedViaX402": "0",
    "price": "0.0001",
    "tokensPerUSDC": 10000
  }
}
```

### GET /api/stats/:address
Get user-specific statistics

**Response:**
```json
{
  "address": "0x...",
  "userStats": {
    "totalPaid": "5.0",
    "totalMinted": "50000"
  }
}
```

## 🏗️ Project Structure

```
x402/
├── contracts/          # Smart contracts (Hardhat)
│   ├── contracts/
│   │   ├── PUMPToken.sol
│   │   └── X402Facilitator.sol
│   └── scripts/deploy.js
│
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── routes/    # API endpoints
│   │   ├── services/  # Business logic
│   │   └── index.ts
│   └── package.json
│
└── frontend/          # Next.js 15 + React
    ├── app/           # Pages
    ├── components/    # UI components
    ├── lib/           # Utilities
    └── package.json
```

## 🔧 Environment Variables

### contracts/.env
```env
PRIVATE_KEY=0x...
BASE_RPC_URL=https://mainnet.base.org
BASESCAN_API_KEY=...
```

### backend/.env
```env
PORT=3001
BASE_RPC_URL=https://mainnet.base.org
PRIVATE_KEY=0x...
PUMP_TOKEN_ADDRESS=0x...
FACILITATOR_ADDRESS=0x...
USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
PAYMENT_RECEIVER_ADDRESS=0x...
```

### frontend/.env.local
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CHAIN_ID=8453
```

## 🧪 Testing x402 Protocol Manually

### 1. Request Payment
```bash
curl http://localhost:3001/api/mint?amount=10000
```

### 2. Send USDC Payment
Use MetaMask or cast:
```bash
cast send 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 \
  "transfer(address,uint256)" \
  <FACILITATOR_ADDRESS> \
  1000000 \
  --rpc-url $BASE_RPC_URL \
  --private-key $PRIVATE_KEY
```

### 3. Submit Payment Proof
```bash
curl -X POST http://localhost:3001/api/mint \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: 0xyour_tx_hash" \
  -d '{
    "userAddress": "0x...",
    "amount": 10000
  }'
```

## 🎨 Customization

### Change Token Name/Symbol
Edit `contracts/contracts/PUMPToken.sol`:
```solidity
constructor() ERC20("Your Token", "YOUR") Ownable(msg.sender) {
```

### Change Price
Edit `PUMPToken.sol`:
```solidity
uint256 public constant TOKENS_PER_USDC = 10_000 * 10**18;
```

### Change Theme
Edit `frontend/app/globals.css` for colors and animations

### Add Features
- Add referral system in `X402Facilitator.sol`
- Add staking in new contract
- Add token vesting for team

## 📚 Learn More

- [x402 Protocol Docs](https://docs.cdp.coinbase.com/x402)
- [Base Network Docs](https://docs.base.org)
- [Hardhat Docs](https://hardhat.org)
- [Next.js Docs](https://nextjs.org/docs)

## 🚨 Important Notes

- **Testnet First:** Always test on Base Sepolia before mainnet
- **Security:** Never commit private keys or .env files
- **Gas Fees:** Keep some ETH for gas on Base
- **USDC:** Base uses bridged USDC at `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

## 🎉 You're Ready!

Your PUMP402 meme token launchpad is now running!

Next steps:
1. Deploy to production (see DEPLOYMENT.md)
2. Market your token on Twitter/Discord
3. Join x402 community
4. Build more features!

---

**Questions?** Open an issue on GitHub or join the community!

