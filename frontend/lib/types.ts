export interface PaymentRequest {
  amount: string;
  currency: string;
  chain: string;
  payTo: string;
  reason: string;
  expiry?: number;
  tokenAmount?: string;
}

export interface TokenStats {
  totalSupply: string;
  maxSupply: string;
  remainingSupply: string;
  totalMintedViaX402: string;
  price: string;
  tokensPerUSDC: number;
}

export interface MintResponse {
  success: boolean;
  message?: string;
  txHash: string;
  tokenAmount: string;
  userAddress: string;
  paymentTxHash: string;
  timestamp: number;
  error?: string;
}

export interface UserStats {
  totalPaid: string;
  totalMinted: string;
}

