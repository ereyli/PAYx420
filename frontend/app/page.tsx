'use client';

import { useState, useEffect } from 'react';
import { Zap, Globe, Shield, TrendingUp, Rocket } from 'lucide-react';
import Stats from '@/components/Stats';
import Pay402Service from '@/components/Pay402Service';
import { getStats } from '@/lib/api';
import { TokenStats } from '@/lib/types';

export default function Home() {
  const [stats, setStats] = useState<TokenStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    // Refresh stats every 10 seconds
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
      // Don't set demo stats, let it fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        </div>

        {/* Header */}
        <header className="relative z-10 container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Rocket className="w-8 h-8 text-blue-500 animate-bounce-slow" />
            <h1 className="text-2xl font-bold gradient-text">PAY402</h1>
          </div>
          <div className="flex gap-4">
            <a
              href="https://docs.cdp.coinbase.com/x402"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              x402 Docs
            </a>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-full mb-8 animate-float">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">First x402 Payment Protocol Meme Token</span>
          </div>

          <h2 className="text-6xl md:text-8xl font-bold mb-6">
            <span className="gradient-text">PAY IT!</span>
          </h2>

          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto">
            The revolutionary meme token using <span className="text-blue-400 font-semibold">HTTP 402</span> payment protocol.
            <br />
            Pay with USDC, get PAY402 tokens instantly. No accounts, no BS!
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6 card-hover">
              <Globe className="w-10 h-10 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Web-Native Payments</h3>
              <p className="text-gray-400 text-sm">First-class HTTP 402 implementation</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6 card-hover">
              <Shield className="w-10 h-10 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Secure & Fast</h3>
              <p className="text-gray-400 text-sm">Base network with instant settlements</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6 card-hover">
              <TrendingUp className="w-10 h-10 text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Early Adopter</h3>
              <p className="text-gray-400 text-sm">Riding the x402 hype wave 🚀</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {!loading && stats && (
        <div className="container mx-auto px-4 pb-12">
          <Stats stats={stats} />
        </div>
      )}

      {/* PAY402 Service Section */}
      <div className="container mx-auto px-4 py-12">
        <Pay402Service />
      </div>

      {/* x402 Explanation */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-2xl p-8 md:p-12">
            <h3 className="text-3xl font-bold mb-6 text-center">
              What is <span className="gradient-text">x402 Protocol</span>?
            </h3>
            
            <div className="space-y-4 text-gray-300">
              <p>
                <span className="font-semibold text-white">x402</span> is an open standard that brings{' '}
                <span className="text-blue-400">native payments to the web</span> using HTTP 402 (Payment Required) status code.
              </p>
              
              <p>
                For decades, HTTP 402 was reserved but unused. x402 finally activates it, enabling:
              </p>

              <ul className="space-y-2 ml-6">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span><strong>Frictionless payments:</strong> No accounts, no subscriptions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span><strong>M2M payments:</strong> Perfect for AI agents and bots</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span><strong>Pay-per-use:</strong> Micropayments for APIs, content, services</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span><strong>Chain-agnostic:</strong> Works on any blockchain</span>
                </li>
              </ul>

              <div className="mt-8 pt-6 border-t border-gray-700">
                <p className="text-sm text-gray-400">
                  🚀 PAY402 is one of the first projects to implement x402 protocol, riding the early hype wave!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>Built with ❤️ using x402 Payment Protocol</p>
          <p className="text-sm mt-2">
            Powered by <span className="text-blue-400">Base Network</span> • Smart Contracts on{' '}
            <a href="https://basescan.org" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              Basescan
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

