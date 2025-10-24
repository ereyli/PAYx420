import axios from 'axios';
import { PaymentRequest, TokenStats, MintResponse, UserStats } from './types';

// Railway backend URL (update with your actual Railway URL)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pay402-backend-production.up.railway.app';

/**
 * Get payment request (402 response)
 */
export async function getPaymentRequest(tokenAmount: number): Promise<PaymentRequest> {
  const response = await axios.get(`${API_URL}/api/mint`, {
    params: { amount: tokenAmount },
    validateStatus: (status) => status === 402, // Expect 402
  });

  return response.data.payment;
}

/**
 * Submit payment and mint tokens
 */
export async function submitPaymentAndMint(
  txHash: string,
  userAddress: string,
  tokenAmount: number
): Promise<MintResponse> {
  const response = await axios.post(
    `${API_URL}/api/mint`,
    {
      userAddress,
      amount: tokenAmount,
    },
    {
      headers: {
        'X-PAYMENT': txHash,
      },
    }
  );

  return response.data;
}

/**
 * Get token statistics
 */
export async function getStats(): Promise<TokenStats> {
  const response = await axios.get(`${API_URL}/api/stats`);
  return response.data.stats;
}

/**
 * Get user statistics
 */
export async function getUserStats(address: string): Promise<UserStats> {
  const response = await axios.get(`${API_URL}/api/stats/${address}`);
  return response.data.userStats;
}

/**
 * PAY402 Token Service API
 */

// Get PAY402 service info
export async function getPay402Info() {
  try {
    const response = await axios.get(`${API_URL}/api/pay402-info`, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    console.error('API Error getPay402Info:', error);
    throw error;
  }
}

// Mint PAY402 tokens with x402 protocol
export async function mintPay402Tokens(amount: number, recipient: string, paymentTxHash?: string) {
  const headers: any = {
    'Content-Type': 'application/json',
  };
  
  // Add X-PAYMENT header if payment transaction hash is provided
  if (paymentTxHash) {
    headers['X-PAYMENT'] = paymentTxHash;
  }
  
  const response = await axios.post(`${API_URL}/seller/api/mint-pay402`, {
    amount,
    recipient
  }, { headers });
  
  return response.data;
}

// Get PAY402 price info
export async function getPay402Price() {
  try {
    const response = await axios.get(`${API_URL}/seller/api/pay402-price`, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    console.error('API Error getPay402Price:', error);
    throw error;
  }
}

// Get PAY402 seller info
export async function getPay402SellerInfo() {
  const response = await axios.get(`${API_URL}/seller/api/pay402-info`);
  return response.data;
}

