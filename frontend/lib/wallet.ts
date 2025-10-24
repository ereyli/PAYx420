import { ethers } from 'ethers';

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const USDC_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function approve(address spender, uint256 amount) returns (bool)',
];

export class WalletService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  /**
   * Check if MetaMask is installed
   */
  isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  /**
   * Connect wallet
   */
  async connect(): Promise<string> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    
    // Request account access
    await this.provider.send('eth_requestAccounts', []);
    
    this.signer = await this.provider.getSigner();
    const address = await this.signer.getAddress();

    // Check if on Base network (chainId: 8453)
    const network = await this.provider.getNetwork();
    
    if (network.chainId !== 8453n) {
      // Try to switch to Base
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x2105' }], // 8453 in hex
        });
      } catch (switchError: any) {
        // Chain not added, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x2105',
                chainName: 'Base',
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://mainnet.base.org'],
                blockExplorerUrls: ['https://basescan.org'],
              },
            ],
          });
        } else {
          throw switchError;
        }
      }
    }

    return address;
  }

  /**
   * Get connected address
   */
  async getAddress(): Promise<string | null> {
    if (!this.signer) return null;
    return await this.signer.getAddress();
  }

  /**
   * Get USDC balance
   */
  async getUSDCBalance(): Promise<string> {
    if (!this.provider || !this.signer) {
      throw new Error('Wallet not connected');
    }

    const address = await this.signer.getAddress();
    const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, this.provider);
    const balance = await usdc.balanceOf(address);

    return ethers.formatUnits(balance, 6); // USDC has 6 decimals
  }

  /**
   * Send USDC payment
   */
  async sendUSDCPayment(to: string, amount: string): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, this.signer);
    
    // Convert amount to USDC units (6 decimals)
    const amountWei = ethers.parseUnits(amount, 6);

    // Send transaction
    const tx = await usdc.transfer(to, amountWei);
    
    // Wait for confirmation
    const receipt = await tx.wait(1);

    return receipt.hash;
  }

  /**
   * Disconnect wallet
   */
  disconnect() {
    this.provider = null;
    this.signer = null;
  }
}

export const walletService = new WalletService();

// Extend window type for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}

