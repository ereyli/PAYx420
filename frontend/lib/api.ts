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
  const response = await axios.get(`${API_URL}/api/pay402-info`);
  return response.data;
}

// Mint PAY402 tokens
export async function mintPay402Tokens(amount: number, recipient: string) {
  const response = await axios.post(`${API_URL}/seller/api/mint-pay402`, {
    amount,
    recipient
  });
  return response.data;
}

// Get PAY402 price info
export async function getPay402Price() {
  const response = await axios.get(`${API_URL}/seller/api/pay402-price`);
  return response.data;
}

// Get PAY402 seller info
export async function getPay402SellerInfo() {
  const response = await axios.get(`${API_URL}/seller/api/pay402-info`);
  return response.data;
}

