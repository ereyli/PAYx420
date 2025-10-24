'use client';

import { useState, useEffect } from 'react';
import { getPay402Info, mintPay402Tokens, getPay402Price } from '@/lib/api';

interface Pay402Info {
  name: string;
  description: string;
  version: string;
  wallet: string;
  endpoints: {
    mint: string;
    price: string;
    info: string;
  };
  pricing: {
    rate: string;
    min: string;
    max: string;
  };
}

interface Pay402Price {
  usdcToPay402: number;
  minPayment: number;
  maxPayment: number;
  description: string;
  network: string;
}

export default function Pay402Service() {
  const [info, setInfo] = useState<Pay402Info | null>(null);
  const [price, setPrice] = useState<Pay402Price | null>(null);
  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState(false);
  const [mintResult, setMintResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    amount: 1,
    recipient: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('Loading PAY402 data from backend...');
      const [infoData, priceData] = await Promise.all([
        getPay402Info(),
        getPay402Price()
      ]);
      console.log('Backend data loaded successfully:', { infoData, priceData });
      setInfo(infoData);
      setPrice(priceData);
    } catch (error) {
      console.error('Backend API failed:', error);
      throw error; // Re-throw error instead of using demo data
    } finally {
      setLoading(false);
    }
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recipient) {
      alert('Please enter recipient address');
      return;
    }

    setMinting(true);
    try {
      // x402-fetch automatically handles HTTP 402 responses and payments
      const result = await mintPay402Tokens(formData.amount, formData.recipient);
      setMintResult(result);
    } catch (error: any) {
      console.error('Error minting tokens:', error);
      alert('Error minting tokens: ' + (error as Error).message);
    } finally {
      setMinting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          PAY402 Token Service
        </h1>

        {info && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Service Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700">Name</h3>
                <p className="text-gray-900">{info.name}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700">Version</h3>
                <p className="text-gray-900">{info.version}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700">Wallet</h3>
                <p className="text-gray-900 font-mono text-sm">{info.wallet}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700">Rate</h3>
                <p className="text-gray-900">{info.pricing.rate}</p>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-900">{info.description}</p>
            </div>
          </div>
        )}

        {price && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Pricing Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-700">Exchange Rate</h3>
                <p className="text-blue-900 text-lg font-bold">
                  {price.usdcToPay402.toLocaleString()} PAY402 per 1 USDC
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-700">Minimum Payment</h3>
                <p className="text-green-900 text-lg font-bold">${price.minPayment}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-700">Maximum Payment</h3>
                <p className="text-orange-900 text-lg font-bold">${price.maxPayment}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-gray-600">{price.description}</p>
              <p className="text-gray-600">Network: {price.network}</p>
            </div>
          </div>
        )}

        <div className="border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">Mint PAY402 Tokens</h2>
          <form onSubmit={handleMint} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                USDC Amount
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="1000"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter USDC amount"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                value={formData.recipient}
                onChange={(e) => setFormData({...formData, recipient: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0x..."
              />
            </div>
            <button
              type="submit"
              disabled={minting || !formData.recipient}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {minting ? 'Minting...' : `Mint ${Math.floor(formData.amount * 10000)} PAY402 Tokens`}
            </button>
          </form>

          {mintResult && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Minting Successful!</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">Transaction Hash:</span> {mintResult.transactionHash}</p>
                <p><span className="font-semibold">Tokens Minted:</span> {mintResult.tokensMinted.toLocaleString()}</p>
                <p><span className="font-semibold">Recipient:</span> {mintResult.recipient}</p>
                <p><span className="font-semibold">Price:</span> {mintResult.price}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
