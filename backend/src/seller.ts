import express from 'express';

const sellerApp = express();

// PAY402 Token Sale API (Simplified x402 Implementation)
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
      message: `Successfully minted ${tokensToMint} PAY402 tokens for ${recipient}`,
      price: `$${amount} USDC = ${tokensToMint} PAY402`
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
    description: "PAY402 Token Exchange Rate",
    network: "base"
  });
});

// PAY402 Service Info
sellerApp.get("/api/pay402-info", (req, res) => {
  res.json({
    name: "PAY402 Token Service",
    description: "Mint PAY402 tokens with USDC payments",
    version: "2.0.0",
    endpoints: {
      mint: "POST /api/mint-pay402",
      price: "GET /api/pay402-price",
      info: "GET /api/pay402-info"
    },
    pricing: {
      rate: "1 USDC = 10,000 PAY402",
      min: "$0.1",
      max: "$1000"
    }
  });
});

export default sellerApp;