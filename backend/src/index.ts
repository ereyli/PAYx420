import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import sellerApp from './seller';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));

app.use(express.json());

// Initialize Wallet
let walletAddress: string;

async function initializeWallet() {
  try {
    if (process.env.PRIVATE_KEY) {
      const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
      walletAddress = account.address;
      console.log('✅ Wallet initialized with MetaMask Private Key');
      console.log(`📍 Wallet Address: ${walletAddress}`);
    } else {
      console.log('⚠️  No private key provided - running in demo mode');
      walletAddress = '0x0000000000000000000000000000000000000000';
    }
  } catch (error) {
    console.error('❌ Failed to initialize wallet:', error);
    console.log('⚠️  Running in demo mode');
    walletAddress = '0x0000000000000000000000000000000000000000';
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    protocol: 'x402',
    timestamp: Date.now(),
    version: '2.0.0',
  });
});

// PAY402 Token Info Endpoint
app.get('/api/pay402-info', (req, res) => {
  res.json({
    name: 'PAY402 Token Service',
    description: 'Mint PAY402 tokens with USDC payments',
    version: '2.0.0',
    wallet: walletAddress,
    endpoints: {
      mint: 'POST /seller/api/mint-pay402',
      price: 'GET /seller/api/pay402-price',
      info: 'GET /seller/api/pay402-info'
    },
    pricing: {
      rate: '1 USDC = 10,000 PAY402',
      min: '$0.1',
      max: '$1000'
    }
  });
});

// Service Discovery (x402 Bazaar)
app.get('/api/services', async (req, res) => {
  try {
    // This would integrate with x402 Bazaar for service discovery
    res.json({
      services: [
        {
          name: 'PAY402 Token Service',
          description: 'Mint PAY402 tokens with USDC payments',
          endpoint: '/api/mint',
          price: '1 USDC = 10,000 PAY402',
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to discover services' });
  }
});

// x402 Seller Routes (PAY402 Token Sales)
app.use('/seller', sellerApp);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// Start server
async function startServer() {
  await initializeWallet();
  
  const port = process.env.PORT || 3001;
  
  app.listen(port, () => {
    console.log('🚀 PAY402 Backend Server');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Server running on port ${port}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Protocol: PAY402 Token Service`);
    console.log(`💰 Wallet: ${walletAddress}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📖 API Endpoints:');
    console.log(`   GET  /api/pay402-info - PAY402 service info`);
    console.log(`   GET  /api/services    - Discover services`);
    console.log(`   GET  /health          - Health check`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📖 Seller Endpoints:');
    console.log(`   POST /seller/api/mint-pay402 - Mint PAY402 tokens`);
    console.log(`   GET  /seller/api/pay402-price - Get PAY402 price`);
    console.log(`   GET  /seller/api/pay402-info  - Seller info`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });
}

startServer().catch(console.error);