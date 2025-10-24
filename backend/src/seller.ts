import express from 'express';
import { paymentMiddleware } from 'x402-express';
import { facilitator } from '@coinbase/x402';

const sellerApp = express();

// PAY402 Token Sale API with x402 Payment
sellerApp.use(paymentMiddleware(
  process.env.PAYMENT_RECEIVER_ADDRESS!, // Your wallet to receive USDC
  {
    "POST /api/mint-pay402": {
      price: "$1.00", // 1 USDC = 10,000 PAY402
      network: "base",
      config: {
        description: "Mint PAY402 tokens with USDC payment",
        inputSchema: {
          type: "object",
          properties: {
            amount: { 
              type: "number", 
              description: "Amount of USDC to pay (minimum $0.1, maximum $1000)" 
            },
            recipient: { 
              type: "string", 
              description: "Wallet address to receive PAY402 tokens" 
            }
          },
          required: ["amount", "recipient"]
        },
        outputSchema: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            transactionHash: { type: "string" },
            tokensMinted: { type: "number" },
            recipient: { type: "string" }
          }
        }
      }
    },
    "GET /api/pay402-price": {
      price: "$0.001", // Small fee for price check
      network: "base",
      config: {
        description: "Get current PAY402 token price and exchange rate",
        outputSchema: {
          type: "object",
          properties: {
            usdcToPay402: { type: "number", description: "PAY402 tokens per 1 USDC" },
            minPayment: { type: "number", description: "Minimum USDC payment" },
            maxPayment: { type: "number", description: "Maximum USDC payment" }
          }
        }
      }
    }
  },
  facilitator // Mainnet facilitator
));

// PAY402 Token Minting Endpoint
sellerApp.post("/api/mint-pay402", async (req, res) => {
  try {
    const { amount, recipient } = req.body;
    
    // Validate input
    if (!amount || !recipient) {
      return res.status(400).json({ error: 'Amount and recipient are required' });
    }
    
    if (amount < 0.1 || amount > 1000) {
      return res.status(400).json({ error: 'Amount must be between $0.1 and $1000' });
    }
    
    // Calculate tokens to mint (1 USDC = 10,000 PAY402)
    const tokensToMint = Math.floor(amount * 10000);
    
    // Here you would integrate with your PAY402 token contract
    // For now, we'll simulate the minting
    const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    
    res.json({
      success: true,
      transactionHash,
      tokensMinted: tokensToMint,
      recipient,
      message: `Successfully minted ${tokensToMint} PAY402 tokens for ${recipient}`
    });
  } catch (error) {
    console.error('Minting error:', error);
    res.status(500).json({ error: 'Failed to mint tokens' });
  }
});

// PAY402 Price Endpoint
sellerApp.get("/api/pay402-price", (req, res) => {
  res.json({
    usdcToPay402: 10000, // 1 USDC = 10,000 PAY402
    minPayment: 0.1,
    maxPayment: 1000,
    description: "PAY402 Token Exchange Rate"
  });
});

export default sellerApp;
