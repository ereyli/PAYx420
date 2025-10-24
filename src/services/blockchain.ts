import { ethers } from 'ethers';
import { config } from '../config';

// ABIs
const PAY402_TOKEN_ABI = [
  'function mintForUser(address user, uint256 usdcAmount, bytes32 txHash) external',
  'function totalSupply() view returns (uint256)',
  'function MAX_SUPPLY() view returns (uint256)',
  'function remainingSupply() view returns (uint256)',
  'function totalMintedViaX402() view returns (uint256)',
  'function TOKENS_PER_USDC() view returns (uint256)',
  'function getTokenAmount(uint256 usdcAmount) view returns (uint256)',
];

const FACILITATOR_ABI = [
  'function processPayment(address user, uint256 usdcAmount, bytes32 txHash) external',
  'function isPaymentProcessed(bytes32 txHash) view returns (bool)',
  'function getUserStats(address user) view returns (uint256 totalPaid, uint256 totalMinted)',
  'function getGlobalStats() view returns (uint256 totalUSDC, uint256 totalPayments, uint256 balance)',
];

const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private pay402Token: ethers.Contract;
  private facilitator: ethers.Contract;
  private usdcToken: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.baseRpcUrl);
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    
    this.pay402Token = new ethers.Contract(
      config.pay402TokenAddress,
      PAY402_TOKEN_ABI,
      this.wallet
    );
    
    this.facilitator = new ethers.Contract(
      config.facilitatorAddress,
      FACILITATOR_ABI,
      this.wallet
    );
    
    this.usdcToken = new ethers.Contract(
      config.usdcAddress,
      ERC20_ABI,
      this.provider
    );
  }

  /**
   * Verify payment transaction on Base blockchain
   */
  async verifyPayment(txHash: string, expectedAmount: string, expectedReceiver: string) {
    try {
      // Get transaction
      const tx = await this.provider.getTransaction(txHash);
      
      if (!tx) {
        return {
          valid: false,
          error: 'Transaction not found',
        };
      }

      // Wait for confirmations (at least 1)
      const receipt = await tx.wait(1);
      
      if (!receipt) {
        return {
          valid: false,
          error: 'Transaction not confirmed',
        };
      }

      // Parse USDC transfer from logs
      const usdcInterface = new ethers.Interface(ERC20_ABI);
      const transferLog = receipt.logs.find(log => {
        try {
          const parsed = usdcInterface.parseLog(log);
          return parsed?.name === 'Transfer';
        } catch {
          return false;
        }
      });

      if (!transferLog) {
        return {
          valid: false,
          error: 'No USDC transfer found in transaction',
        };
      }

      const parsed = usdcInterface.parseLog(transferLog);
      const [from, to, amount] = parsed?.args || [];

      // Validate receiver
      if (to.toLowerCase() !== expectedReceiver.toLowerCase()) {
        return {
          valid: false,
          error: `Invalid receiver. Expected ${expectedReceiver}, got ${to}`,
        };
      }

      // Validate amount (USDC has 6 decimals)
      const amountUSDC = ethers.formatUnits(amount, 6);
      const expectedUSDC = ethers.formatUnits(expectedAmount, 6);
      
      if (parseFloat(amountUSDC) < parseFloat(expectedUSDC)) {
        return {
          valid: false,
          error: `Insufficient payment. Expected ${expectedUSDC} USDC, got ${amountUSDC} USDC`,
        };
      }

      // Get block for timestamp
      const block = await this.provider.getBlock(receipt.blockNumber);

      return {
        valid: true,
        txHash: txHash,
        from: from,
        to: to,
        amount: amount.toString(),
        confirmations: await receipt.confirmations(),
        timestamp: block?.timestamp || 0,
      };
    } catch (error: any) {
      console.error('Payment verification error:', error);
      return {
        valid: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  /**
   * Process payment and mint tokens via Facilitator contract
   */
  async processPaymentAndMint(
    userAddress: string,
    usdcAmount: string,
    txHash: string
  ) {
    try {
      const txHashBytes = ethers.id(txHash); // Convert to bytes32
      
      // Check if already processed
      const isProcessed = await this.facilitator.isPaymentProcessed(txHashBytes);
      
      if (isProcessed) {
        throw new Error('Payment already processed');
      }

      // Process payment via Facilitator
      const tx = await this.facilitator.processPayment(
        userAddress,
        usdcAmount,
        txHashBytes
      );

      const receipt = await tx.wait();

      // Calculate token amount
      const tokenAmount = await this.pay402Token.getTokenAmount(usdcAmount);

      return {
        success: true,
        txHash: receipt.hash,
        tokenAmount: ethers.formatEther(tokenAmount),
        userAddress,
        timestamp: Date.now(),
      };
    } catch (error: any) {
      console.error('Mint error:', error);
      return {
        success: false,
        txHash: '',
        tokenAmount: '0',
        userAddress,
        timestamp: Date.now(),
        error: error.message || 'Mint failed',
      };
    }
  }

  /**
   * Get token statistics
   */
  async getStats() {
    try {
      const [totalSupply, maxSupply, remainingSupply, totalMintedViaX402, tokensPerUSDC] =
        await Promise.all([
          this.pay402Token.totalSupply(),
          this.pay402Token.MAX_SUPPLY(),
          this.pay402Token.remainingSupply(),
          this.pay402Token.totalMintedViaX402(),
          this.pay402Token.TOKENS_PER_USDC(),
        ]);

      return {
        totalSupply: ethers.formatEther(totalSupply),
        maxSupply: ethers.formatEther(maxSupply),
        remainingSupply: ethers.formatEther(remainingSupply),
        totalMintedViaX402: ethers.formatEther(totalMintedViaX402),
        price: '0.0001', // 1 USDC / 10,000 tokens
        tokensPerUSDC: Number(ethers.formatEther(tokensPerUSDC)),
      };
    } catch (error) {
      console.error('Failed to get stats:', error);
      throw error;
    }
  }

  /**
   * Get user stats
   */
  async getUserStats(userAddress: string) {
    try {
      const [totalPaid, totalMinted] = await this.facilitator.getUserStats(userAddress);

      return {
        totalPaid: ethers.formatUnits(totalPaid, 6), // USDC 6 decimals
        totalMinted: ethers.formatEther(totalMinted),
      };
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return {
        totalPaid: '0',
        totalMinted: '0',
      };
    }
  }
}

export const blockchain = new BlockchainService();

