import { Router } from 'express';
import { blockchain } from '../services/blockchain';
import { paymentService } from '../services/payment';
import { config } from '../config';
import { MintRequest, X402Response } from '../types';

const router = Router();

/**
 * GET /api/mint
 * Returns 402 Payment Required with payment details
 */
router.get('/mint', async (req, res) => {
  try {
    const { amount } = req.query;

    if (!amount) {
      return res.status(400).json({
        error: 'Missing amount parameter',
        example: '/api/mint?amount=10000',
      });
    }

    const tokenAmount = parseInt(amount as string);

    if (isNaN(tokenAmount) || tokenAmount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount',
      });
    }

    // Generate payment request
    const paymentRequest = paymentService.generatePaymentRequest(tokenAmount);

    // Return 402 Payment Required
    const response: X402Response = {
      status: 402,
      payment: paymentRequest,
    };

    return res.status(402).json(response);
  } catch (error: any) {
    console.error('Error generating payment request:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * POST /api/mint
 * Process payment and mint tokens
 * Requires X-PAYMENT header with transaction hash
 */
router.post('/mint', async (req, res) => {
  try {
    const txHash = req.headers['x-payment'] as string;
    const { userAddress, amount } = req.body as MintRequest;

    // Validate inputs
    if (!txHash) {
      return res.status(400).json({
        error: 'Missing X-PAYMENT header',
      });
    }

    if (!userAddress) {
      return res.status(400).json({
        error: 'Missing userAddress in request body',
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount',
      });
    }

    // Check if already processed
    if (paymentService.isPaymentProcessed(txHash)) {
      return res.status(409).json({
        error: 'Payment already processed',
        txHash,
      });
    }

    // Calculate required USDC amount
    const requiredUSDC = paymentService.calculateUSDCAmount(amount);
    const requiredUSDCWei = (requiredUSDC * 1e6).toString(); // USDC 6 decimals

    // Verify payment on blockchain
    const paymentVerification = await blockchain.verifyPayment(
      txHash,
      requiredUSDCWei,
      config.paymentReceiverAddress || config.facilitatorAddress
    );

    if (!paymentVerification.valid) {
      // Payment invalid -> return 402 again
      const paymentRequest = paymentService.generatePaymentRequest(amount);
      
      return res.status(402).json({
        status: 402,
        payment: paymentRequest,
        error: paymentVerification.error,
      });
    }

    // Payment verified -> process mint
    const mintResult = await blockchain.processPaymentAndMint(
      userAddress,
      requiredUSDCWei,
      txHash
    );

    if (!mintResult.success) {
      return res.status(500).json({
        error: mintResult.error || 'Mint failed',
      });
    }

    // Mark as processed
    paymentService.markAsProcessed(txHash);

    // Return 200 OK with X-PAYMENT-RESPONSE header
    res.setHeader('X-PAYMENT-RESPONSE', JSON.stringify({
      settled: true,
      txHash: mintResult.txHash,
      tokenAmount: mintResult.tokenAmount,
      timestamp: mintResult.timestamp,
    }));

    return res.status(200).json({
      success: true,
      message: 'Tokens minted successfully!',
      txHash: mintResult.txHash,
      tokenAmount: mintResult.tokenAmount,
      userAddress: mintResult.userAddress,
      paymentTxHash: txHash,
      timestamp: mintResult.timestamp,
    });
  } catch (error: any) {
    console.error('Error processing mint:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
});

export default router;

