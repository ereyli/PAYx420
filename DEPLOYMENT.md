# 🚀 PUMP402 Deployment Guide

Complete step-by-step guide to deploy PUMP402 on Base Mainnet.

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ Node.js 18+ installed
- ✅ MetaMask wallet with ETH on Base network (for gas)
- ✅ Private key for deployment wallet
- ✅ Base RPC URL (Alchemy, Infura, or public RPC)
- ✅ (Optional) Basescan API key for contract verification

## 💰 Funding Requirements

You'll need:
- **~0.05 ETH on Base** for contract deployment gas fees
- **Some USDC on Base** for testing mint functionality

## 🎯 Step-by-Step Deployment

### 1️⃣ Clone and Setup

```bash
# Clone repository
cd x402

# Install all dependencies
npm install -ws
```

### 2️⃣ Configure Smart Contracts

```bash
cd contracts

# Copy environment template
cp env.example .env

# Edit .env file
nano .env
```

Add your credentials:
```env
PRIVATE_KEY=0xyour_private_key_here
BASE_RPC_URL=https://mainnet.base.org
BASESCAN_API_KEY=your_basescan_key (optional)
```

### 3️⃣ Deploy Smart Contracts

```bash
# Install contract dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy to Base Mainnet
npm run deploy

# ✅ Save the deployed addresses!
# Output will show:
# - PUMP Token address
# - X402 Facilitator address
```

**Important:** Copy the deployed contract addresses!

### 4️⃣ Verify Contracts on Basescan (Optional but Recommended)

```bash
# Verify PUMP Token
npx hardhat verify --network base <PUMP_TOKEN_ADDRESS>

# Verify Facilitator
npx hardhat verify --network base <FACILITATOR_ADDRESS> <PUMP_TOKEN_ADDRESS> 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
```

### 5️⃣ Configure Backend

```bash
cd ../backend

# Copy environment template
cp env.example .env

# Edit .env file
nano .env
```

Add your configuration:
```env
PORT=3001
NODE_ENV=production

# Blockchain
BASE_RPC_URL=https://mainnet.base.org
PRIVATE_KEY=0xyour_backend_private_key

# Contract Addresses (from step 3)
PUMP_TOKEN_ADDRESS=0x...
FACILITATOR_ADDRESS=0x...
USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

# Payment receiver (use Facilitator address)
PAYMENT_RECEIVER_ADDRESS=0xyour_facilitator_address

# CORS
ALLOWED_ORIGINS=https://your-frontend-domain.com,http://localhost:3000
```

### 6️⃣ Run Backend

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start production server
npm start

# Or for development:
npm run dev
```

Backend will run on `http://localhost:3001`

### 7️⃣ Configure Frontend

```bash
cd ../frontend

# Copy environment template
cp env.example .env.local

# Edit .env.local
nano .env.local
```

Add your configuration:
```env
# Point to your backend API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Or if backend is deployed:
# NEXT_PUBLIC_API_URL=https://your-api-domain.com

NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_PUMP_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_FACILITATOR_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
```

### 8️⃣ Run Frontend

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start

# Or for development:
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🌐 Production Deployment

### Backend Deployment (Railway/Render/DigitalOcean)

**Railway:**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
cd backend
railway up
```

**Render:**
1. Connect GitHub repo
2. Select `backend` directory
3. Add environment variables
4. Deploy

**DigitalOcean App Platform:**
1. Connect GitHub repo
2. Set root directory to `backend`
3. Build command: `npm run build`
4. Run command: `npm start`
5. Add environment variables

### Frontend Deployment (Vercel/Netlify)

**Vercel (Recommended for Next.js):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Production deployment
vercel --prod
```

**Netlify:**
1. Connect GitHub repo
2. Set root directory to `frontend`
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Add environment variables

## ✅ Post-Deployment Checklist

After deployment, verify:

- [ ] Smart contracts deployed and verified on Basescan
- [ ] Facilitator is set as trusted minter in PUMP token
- [ ] Backend API is accessible and returning health check
- [ ] Frontend can connect to backend API
- [ ] MetaMask can connect to Base network
- [ ] Test mint with small amount (e.g., 1000 PUMP)
- [ ] USDC payment goes to correct address
- [ ] Tokens are minted successfully
- [ ] Transaction appears on Basescan

## 🧪 Testing

### Test on Base Sepolia First (Recommended)

```bash
# Deploy to testnet first
cd contracts
npm run deploy:sepolia

# Update backend/frontend .env files with testnet addresses
# Test complete flow on testnet
# Then deploy to mainnet when confident
```

### Manual Testing

1. **Connect Wallet**
   - Open frontend in browser
   - Click "Connect Wallet"
   - Approve MetaMask connection

2. **Request Payment (Step 1)**
   ```bash
   curl http://localhost:3001/api/mint?amount=10000
   ```
   Should return 402 with payment details

3. **Send USDC Payment**
   - Use MetaMask to send USDC to payTo address
   - Copy transaction hash

4. **Submit Payment and Mint (Step 2)**
   ```bash
   curl -X POST http://localhost:3001/api/mint \
     -H "Content-Type: application/json" \
     -H "X-PAYMENT: 0xyour_tx_hash" \
     -d '{"userAddress": "0xyour_address", "amount": 10000}'
   ```

5. **Check Stats**
   ```bash
   curl http://localhost:3001/api/stats
   ```

## 🔧 Troubleshooting

### Contract Deployment Fails
- **Issue:** Insufficient gas
- **Fix:** Add more ETH to deployment wallet

### Backend Can't Verify Payments
- **Issue:** RPC rate limiting
- **Fix:** Use paid RPC (Alchemy/Infura) or increase timeout

### Frontend Can't Connect
- **Issue:** CORS error
- **Fix:** Add frontend domain to `ALLOWED_ORIGINS` in backend .env

### Mint Fails
- **Issue:** "Not authorized minter"
- **Fix:** Ensure Facilitator address is set as trusted minter:
  ```bash
  # Using cast (Foundry)
  cast send <PUMP_TOKEN_ADDRESS> \
    "setTrustedMinter(address)" <FACILITATOR_ADDRESS> \
    --rpc-url $BASE_RPC_URL \
    --private-key $PRIVATE_KEY
  ```

### MetaMask Shows Wrong Network
- **Issue:** User on wrong chain
- **Fix:** Wallet service automatically prompts to switch to Base

## 📊 Monitoring

### Check Contract State

```bash
# Total supply
cast call <PUMP_TOKEN_ADDRESS> "totalSupply()" --rpc-url $BASE_RPC_URL

# Remaining supply
cast call <PUMP_TOKEN_ADDRESS> "remainingSupply()" --rpc-url $BASE_RPC_URL

# Total minted via x402
cast call <PUMP_TOKEN_ADDRESS> "totalMintedViaX402()" --rpc-url $BASE_RPC_URL
```

### Monitor Backend Logs

```bash
# Railway
railway logs

# Render
# Check dashboard logs

# DigitalOcean
doctl apps logs <app-id>
```

## 🎉 Success!

If all steps completed successfully:
- ✅ Smart contracts are live on Base
- ✅ Backend API is running
- ✅ Frontend is accessible
- ✅ Users can mint PUMP tokens via x402 protocol

Share your deployment:
- Tweet about it with #x402 #PUMP402 #Base
- Add to x402 showcase
- Join Base and x402 communities

## 🆘 Need Help?

- GitHub Issues: Create an issue
- Discord: Join Base/CDP Discord
- Twitter: Tag @base and @coinbase

---

**Built with x402 Protocol** 🚀 | **Deployed on Base** ⚡

