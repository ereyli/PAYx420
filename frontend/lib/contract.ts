import { ethers } from 'ethers';

// Contract addresses
export const FACILITATOR_ADDRESS = process.env.NEXT_PUBLIC_FACILITATOR_ADDRESS || '';
export const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
export const PAY402_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_PAY402_TOKEN_ADDRESS || '';

// ABIs
const USDC_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

const FACILITATOR_ABI = [
  'function payAndMint(uint256 amount) external',
  'function getGlobalStats() view returns (uint256 totalUSDC, uint256 totalPayments, uint256 balance)',
  'function getUserStats(address user) view returns (uint256 totalPaid, uint256 totalMinted)',
  'function processedPayments(bytes32) view returns (bool)',
];

const PAY402_TOKEN_ABI = [
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function MAX_SUPPLY() view returns (uint256)',
  'function remainingSupply() view returns (uint256)',
  'function totalMintedViaX402() view returns (uint256)',
  'function TOKENS_PER_USDC() view returns (uint256)',
];

export interface MintResult {
  success: boolean;
  txHash: string;
  tokenAmount: string;
  error?: string;
}

export interface TokenStats {
  totalSupply: string;
  maxSupply: string;
  remainingSupply: string;
  totalMintedViaX402: string;
  price: string;
  tokensPerUSDC: number;
}

export interface UserStats {
  totalPaid: string;
  totalMinted: string;
}

/**
 * Approve USDC spending
 */
export async function approveUSDC(
  signer: ethers.Signer,
  amount: string
): Promise<string> {
  const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
  const tx = await usdc.approve(FACILITATOR_ADDRESS, amount);
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Check USDC allowance
 */
export async function checkAllowance(
  provider: ethers.Provider,
  owner: string
): Promise<bigint> {
  const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
  return await usdc.allowance(owner, FACILITATOR_ADDRESS);
}

/**
 * Get USDC balance
 */
export async function getUSDCBalance(
  provider: ethers.Provider,
  address: string
): Promise<string> {
  const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
  const balance = await usdc.balanceOf(address);
  return ethers.formatUnits(balance, 6); // USDC has 6 decimals
}

/**
 * Mint tokens directly (no backend needed!)
 */
export async function mintTokensDirect(
  signer: ethers.Signer,
  tokenAmount: number
): Promise<MintResult> {
  try {
    // Calculate USDC amount needed (6 decimals)
    const usdcAmount = tokenAmount / 10000; // 10,000 PAY402 = 1 USDC
    const usdcAmountWei = ethers.parseUnits(usdcAmount.toString(), 6);

    console.log('💰 Minting', tokenAmount, 'PAY402 tokens');
    console.log('💵 Cost:', usdcAmount, 'USDC');

    // Check allowance
    const owner = await signer.getAddress();
    const provider = signer.provider!;
    const currentAllowance = await checkAllowance(provider, owner);

    // If allowance is insufficient, approve
    if (currentAllowance < usdcAmountWei) {
      console.log('📝 Approving USDC...');
      await approveUSDC(signer, usdcAmountWei.toString());
      console.log('✅ USDC approved');
    }

    // Call payAndMint
    console.log('🚀 Calling payAndMint...');
    const facilitator = new ethers.Contract(
      FACILITATOR_ADDRESS,
      FACILITATOR_ABI,
      signer
    );

    const tx = await facilitator.payAndMint(usdcAmountWei);
    console.log('⏳ Waiting for confirmation...');
    
    const receipt = await tx.wait();
    console.log('✅ Minted successfully!');

    return {
      success: true,
      txHash: receipt.hash,
      tokenAmount: tokenAmount.toString(),
    };
  } catch (error: any) {
    console.error('❌ Mint failed:', error);
    return {
      success: false,
      txHash: '',
      tokenAmount: '0',
      error: error.message || 'Mint failed',
    };
  }
}

/**
 * Get token statistics
 */
export async function getTokenStats(
  provider: ethers.Provider
): Promise<TokenStats> {
  const pay402Token = new ethers.Contract(PAY402_TOKEN_ADDRESS, PAY402_TOKEN_ABI, provider);

  const [totalSupply, maxSupply, remainingSupply, totalMintedViaX402, tokensPerUSDC] =
    await Promise.all([
      pay402Token.totalSupply(),
      pay402Token.MAX_SUPPLY(),
      pay402Token.remainingSupply(),
      pay402Token.totalMintedViaX402(),
      pay402Token.TOKENS_PER_USDC(),
    ]);

  return {
    totalSupply: ethers.formatEther(totalSupply),
    maxSupply: ethers.formatEther(maxSupply),
    remainingSupply: ethers.formatEther(remainingSupply),
    totalMintedViaX402: ethers.formatEther(totalMintedViaX402),
    price: '0.0001', // 1 USDC / 10,000 tokens
    tokensPerUSDC: Number(ethers.formatEther(tokensPerUSDC)),
  };
}

/**
 * Get user statistics
 */
export async function getUserStatsDirect(
  provider: ethers.Provider,
  address: string
): Promise<UserStats> {
  try {
    const facilitator = new ethers.Contract(
      FACILITATOR_ADDRESS,
      FACILITATOR_ABI,
      provider
    );

    const [totalPaid, totalMinted] = await facilitator.getUserStats(address);

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

/**
 * Get PAY402 token balance
 */
export async function getPAY402Balance(
  provider: ethers.Provider,
  address: string
): Promise<string> {
  try {
    const pay402Token = new ethers.Contract(PAY402_TOKEN_ADDRESS, PAY402_TOKEN_ABI, provider);
    const balance = await pay402Token.balanceOf(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Failed to get PAY402 balance:', error);
    return '0';
  }
}

