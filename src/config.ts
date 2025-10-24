import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Blockchain
  baseRpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
  privateKey: process.env.PRIVATE_KEY || '',
  
  // Contracts
  pay402TokenAddress: process.env.PAY402_TOKEN_ADDRESS || '',
  facilitatorAddress: process.env.FACILITATOR_ADDRESS || '',
  usdcAddress: process.env.USDC_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  
  // x402 Protocol
  paymentReceiverAddress: process.env.PAYMENT_RECEIVER_ADDRESS || '',
  
  // Payment Settings
  tokensPerUSDC: 10000, // 10,000 PAY402 per 1 USDC
  minPaymentUSDC: 0.1, // Minimum 0.1 USDC
  maxPaymentUSDC: 10000, // Maximum 10,000 USDC
  paymentExpirySeconds: 600, // 10 minutes
  
  // Coinbase CDP Facilitator (optional)
  facilitatorApiUrl: process.env.FACILITATOR_API_URL || '',
  facilitatorApiKey: process.env.FACILITATOR_API_KEY || '',
  
  // Security
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
};

// Validation
if (!config.privateKey) {
  console.warn('⚠️  PRIVATE_KEY not set');
}

if (!config.pay402TokenAddress) {
  console.warn('⚠️  PAY402_TOKEN_ADDRESS not set');
}

if (!config.facilitatorAddress) {
  console.warn('⚠️  FACILITATOR_ADDRESS not set');
}
