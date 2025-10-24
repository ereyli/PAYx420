'use client';

import { TrendingUp, Users, DollarSign, Coins } from 'lucide-react';
import { TokenStats } from '@/lib/types';

interface StatsProps {
  stats: TokenStats;
}

export default function Stats({ stats }: StatsProps) {
  const formatNumber = (num: string) => {
    return parseFloat(num).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const supplyPercentage = (parseFloat(stats.totalSupply) / parseFloat(stats.maxSupply)) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Supply */}
      <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6 card-hover">
        <div className="flex items-center justify-between mb-4">
          <Coins className="w-10 h-10 text-yellow-500" />
          <div className="text-right">
            <p className="text-sm text-gray-400">Total Supply</p>
            <p className="text-2xl font-bold">{formatNumber(stats.totalSupply)}</p>
          </div>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all"
            style={{ width: `${supplyPercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {supplyPercentage.toFixed(2)}% of max supply
        </p>
      </div>

      {/* Minted via x402 */}
      <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6 card-hover">
        <div className="flex items-center justify-between mb-4">
          <TrendingUp className="w-10 h-10 text-green-500" />
          <div className="text-right">
            <p className="text-sm text-gray-400">Minted via x402</p>
            <p className="text-2xl font-bold">{formatNumber(stats.totalMintedViaX402)}</p>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Using HTTP 402 protocol
        </p>
      </div>

      {/* Price */}
      <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6 card-hover">
        <div className="flex items-center justify-between mb-4">
          <DollarSign className="w-10 h-10 text-blue-500" />
          <div className="text-right">
            <p className="text-sm text-gray-400">Price</p>
            <p className="text-2xl font-bold">${stats.price}</p>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          1 USDC = {stats.tokensPerUSDC.toLocaleString()} PUMP
        </p>
      </div>

      {/* Remaining Supply */}
      <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6 card-hover">
        <div className="flex items-center justify-between mb-4">
          <Users className="w-10 h-10 text-purple-500" />
          <div className="text-right">
            <p className="text-sm text-gray-400">Remaining</p>
            <p className="text-2xl font-bold">{formatNumber(stats.remainingSupply)}</p>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Tokens available to mint
        </p>
      </div>
    </div>
  );
}

