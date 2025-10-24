import { ethers } from 'ethers';
import { config } from '../config';
import { PaymentRequest } from '../types';

// In-memory storage for pending payments (use Redis in production)
const pendingPayments = new Map<string, PaymentRequest>();
const processedPayments = new Set<string>();

export class PaymentService {
  /**
   * Generate x402 payment request
   */
  generatePaymentRequest(tokenAmount: number): PaymentRequest {
    // Calculate USDC amount needed
    const usdcAmount = tokenAmount / config.tokensPerUSDC;
    
    // Validate amount
    if (usdcAmount < config.minPaymentUSDC) {
      throw new Error(`Minimum payment is ${config.minPaymentUSDC} USDC`);
    }
    
    if (usdcAmount > config.maxPaymentUSDC) {
      throw new Error(`Maximum payment is ${config.maxPaymentUSDC} USDC`);
    }

    // Create payment request
    const paymentRequest: PaymentRequest = {
      amount: usdcAmount.toFixed(6), // USDC 6 decimals
      currency: 'USDC',
      chain: 'base',
      payTo: config.paymentReceiverAddress || config.facilitatorAddress,
      reason: `Mint ${tokenAmount.toLocaleString()} PUMP tokens`,
      expiry: Math.floor(Date.now() / 1000) + config.paymentExpirySeconds,
      tokenAmount: tokenAmount.toString(),
    };

    // Store pending payment
    const paymentId = this.generatePaymentId(paymentRequest);
    pendingPayments.set(paymentId, paymentRequest);

    // Clean up after expiry
    setTimeout(() => {
      pendingPayments.delete(paymentId);
    }, config.paymentExpirySeconds * 1000);

    return paymentRequest;
  }

  /**
   * Verify if payment request is valid
   */
  isValidPaymentRequest(paymentRequest: PaymentRequest): boolean {
    const now = Math.floor(Date.now() / 1000);
    
    // Check expiry
    if (paymentRequest.expiry && paymentRequest.expiry < now) {
      return false;
    }

    // Check amount
    const amount = parseFloat(paymentRequest.amount);
    if (amount < config.minPaymentUSDC || amount > config.maxPaymentUSDC) {
      return false;
    }

    // Check receiver address
    if (paymentRequest.payTo.toLowerCase() !== config.paymentReceiverAddress.toLowerCase() &&
        paymentRequest.payTo.toLowerCase() !== config.facilitatorAddress.toLowerCase()) {
      return false;
    }

    return true;
  }

  /**
   * Mark payment as processed
   */
  markAsProcessed(txHash: string): void {
    processedPayments.add(txHash.toLowerCase());
  }

  /**
   * Check if payment already processed
   */
  isPaymentProcessed(txHash: string): boolean {
    return processedPayments.has(txHash.toLowerCase());
  }

  /**
   * Generate unique payment ID
   */
  private generatePaymentId(paymentRequest: PaymentRequest): string {
    return ethers.id(JSON.stringify(paymentRequest));
  }

  /**
   * Calculate token amount from USDC amount
   */
  calculateTokenAmount(usdcAmount: number): number {
    return usdcAmount * config.tokensPerUSDC;
  }

  /**
   * Calculate USDC amount from token amount
   */
  calculateUSDCAmount(tokenAmount: number): number {
    return tokenAmount / config.tokensPerUSDC;
  }
}

export const paymentService = new PaymentService();

