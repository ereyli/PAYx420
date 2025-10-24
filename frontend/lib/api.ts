import axios from 'axios';
import { PaymentRequest, TokenStats, MintResponse, UserStats } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

