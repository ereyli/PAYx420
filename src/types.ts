export interface PaymentRequest {
  amount: string;           // USDC amount
  currency: string;         // "USDC"
  chain: string;            // "base"
  payTo: string;            // Receiver address
  reason: string;           // Payment description
  expiry?: number;          // Unix timestamp
  tokenAmount?: string;     // PUMP tokens to receive
}

export interface PaymentVerification {
  valid: boolean;
  txHash: string;
  from: string;
  to: string;
  amount: string;
  confirmations: number;
  timestamp: number;
  error?: string;
}

export interface MintRequest {
  userAddress: string;
  amount: number;           // PUMP tokens to mint
}

export interface MintResponse {
  success: boolean;
  txHash: string;
  tokenAmount: string;
  userAddress: string;
  timestamp: number;
  error?: string;
}

export interface X402Response {
  status: 402;
  payment: PaymentRequest;
}

export interface StatsResponse {
  totalSupply: string;
  maxSupply: string;
  remainingSupply: string;
  totalMintedViaX402: string;
  price: string;
  tokensPerUSDC: number;
}

