'use client';

import { useState } from 'react';
import { Wallet, Loader2, Check, AlertCircle } from 'lucide-react';
import { walletService } from '@/lib/wallet';
import { getPaymentRequest, submitPaymentAndMint } from '@/lib/api';

interface MintCardProps {
  onMintSuccess?: () => void;
}

export default function MintCard({ onMintSuccess }: MintCardProps) {
  const [tokenAmount, setTokenAmount] = useState<number>(10000);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [usdcBalance, setUsdcBalance] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'requesting' | 'paying' | 'minting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');

  const usdcAmount = tokenAmount / 10000;

  const handleConnect = async () => {
    try {
      setStatus('connecting');
      setLoading(true);
      
      const address = await walletService.connect();
      setWalletAddress(address);
      
      const balance = await walletService.getUSDCBalance();
      setUsdcBalance(balance);
      
      setMessage('Wallet connected!');
      setStatus('idle');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleMint = async () => {
    if (!walletAddress) {
      setMessage('Please connect wallet first');
      return;
    }

    try {
      setLoading(true);
      setStatus('requesting');
      setMessage('Requesting payment details...');

      // Step 1: Get payment request (402 response)
      const paymentRequest = await getPaymentRequest(tokenAmount);
      
      setStatus('paying');
      setMessage(`Please send ${paymentRequest.amount} USDC to complete the mint...`);

      // Step 2: Send USDC payment
      const paymentTxHash = await walletService.sendUSDCPayment(
        paymentRequest.payTo,
        paymentRequest.amount
      );

      setStatus('minting');
      setMessage('Payment confirmed! Minting tokens...');

      // Step 3: Submit payment proof and mint
      const mintResponse = await submitPaymentAndMint(
        paymentTxHash,
        walletAddress,
        tokenAmount
      );

      if (mintResponse.success) {
        setStatus('success');
        setTxHash(mintResponse.txHash);
            setMessage(`🎉 Successfully minted ${Number(mintResponse.tokenAmount).toLocaleString()} PAY402 tokens!`);
        
        // Refresh balance
        const newBalance = await walletService.getUSDCBalance();
        setUsdcBalance(newBalance);

        // Callback to refresh stats
        if (onMintSuccess) {
          onMintSuccess();
        }

        // Reset after 5 seconds
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 5000);
      } else {
        throw new Error(mintResponse.error || 'Mint failed');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Transaction failed');
      
      // Reset after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'minting':
      case 'paying':
      case 'requesting':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <Check className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'minting':
      case 'paying':
      case 'requesting':
      case 'connecting':
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 glow">
      {/* Connect Wallet */}
      {!walletAddress ? (
        <div className="text-center">
          <button
            onClick={handleConnect}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-4 px-8 rounded-xl transition-all transform hover:scale-105 button-ripple flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                Connect Wallet
              </>
            )}
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Connect your wallet to start minting PAY402 tokens
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Wallet Info */}
          <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Connected Wallet</span>
              <button
                onClick={() => {
                  walletService.disconnect();
                  setWalletAddress('');
                  setUsdcBalance('');
                }}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Disconnect
              </button>
            </div>
            <p className="text-sm font-mono text-gray-300 mb-3">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">USDC Balance:</span>
              <span className="font-semibold">{parseFloat(usdcBalance).toFixed(2)} USDC</span>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              PAY402 Tokens to Mint
            </label>
            <div className="relative">
              <input
                type="number"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(Math.max(1000, parseInt(e.target.value) || 1000))}
                min="1000"
                step="1000"
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-lg font-semibold focus:outline-none focus:border-blue-500 transition-colors"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                PAY402
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2 mt-3">
              {[10000, 50000, 100000, 500000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTokenAmount(amount)}
                  className="bg-gray-700/50 hover:bg-gray-600/50 rounded-lg py-2 text-sm transition-colors"
                >
                  {amount >= 1000 ? `${amount / 1000}K` : amount}
                </button>
              ))}
            </div>
          </div>

          {/* Price Info */}
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-4 border border-blue-500/30">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">You Pay:</span>
              <span className="text-2xl font-bold text-white">{usdcAmount.toFixed(2)} USDC</span>
            </div>
            <div className="flex justify-between items-center mt-2 text-sm">
              <span className="text-gray-400">Rate:</span>
              <span className="text-gray-300">1 USDC = 10,000 PAY402</span>
            </div>
          </div>

          {/* Mint Button */}
          <button
            onClick={handleMint}
            disabled={loading || tokenAmount < 1000}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 disabled:scale-100 button-ripple glow-green"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                {status === 'requesting' && 'Requesting Payment...'}
                {status === 'paying' && 'Waiting for Payment...'}
                {status === 'minting' && 'Minting Tokens...'}
                {status === 'connecting' && 'Connecting...'}
              </span>
            ) : (
              '🚀 MINT PAY402 TOKENS'
            )}
          </button>

          {/* Status Message */}
          {message && (
            <div className={`flex items-center gap-2 p-4 rounded-xl bg-gray-900/50 border ${
              status === 'error' ? 'border-red-500/50' : status === 'success' ? 'border-green-500/50' : 'border-blue-500/50'
            }`}>
              {getStatusIcon()}
              <p className={`text-sm ${getStatusColor()}`}>{message}</p>
            </div>
          )}

          {/* Transaction Link */}
          {txHash && status === 'success' && (
            <a
              href={`https://basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-sm text-blue-400 hover:text-blue-300 hover:underline"
            >
              View transaction on Basescan →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

