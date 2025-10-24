import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { wrapFetchWithPayment } from 'x402-fetch';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));

app.use(express.json());

// Initialize x402 with MetaMask/Private Key
let fetchWithPayment: typeof fetch;

async function initializeX402() {
  try {
    // Option 1: Use private key (MetaMask private key)
    const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
    
    // Option 2: Use CDP Wallet (if available)
    // const cdp = new CdpClient({
    //   apiKeyId: process.env.CDP_API_KEY_ID!,
    //   apiKeySecret: process.env.CDP_API_KEY_SECRET!,
    // });
    // const cdpAccount = await cdp.evm.createAccount({
    //   walletSecret: process.env.CDP_WALLET_SECRET!,
    // });
    // const account = toAccount(cdpAccount);
    
    fetchWithPayment = wrapFetchWithPayment(fetch, account);
    
    console.log('✅ x402 initialized with MetaMask Wallet');
    console.log(`📍 Wallet Address: ${account.address}`);
  } catch (error) {
    console.error('❌ Failed to initialize x402:', error);
    process.exit(1);
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

// x402 Payment Endpoint
app.post('/api/payment', async (req, res) => {
  try {
    const { url, method = 'GET', body } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const response = await fetchWithPayment(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    
    res.json({
      success: true,
      data,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({
      error: 'Payment failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
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
  await initializeX402();
  
  const port = process.env.PORT || 3001;
  
  app.listen(port, () => {
    console.log('🚀 PAY402 x402 Backend Server');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Server running on port ${port}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Protocol: x402 (MetaMask)`);
    console.log(`💰 MetaMask Wallet: Connected`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📖 API Endpoints:');
    console.log(`   POST /api/payment     - Make x402 payments`);
    console.log(`   GET  /api/services    - Discover services`);
    console.log(`   GET  /health          - Health check`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });
}

startServer().catch(console.error);