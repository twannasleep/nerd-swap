'use client';

import { useEffect, useState } from 'react';
import { useAccount, useChainId, useClient } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BNB_TESTNET_CHAIN_ID } from '@/features/swap/constants';

export function NetworkStatus() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const client = useClient();
  const [isTestnet, setIsTestnet] = useState<boolean | null>(null);

  useEffect(() => {
    const checkNetwork = async () => {
      if (isConnected && chainId) {
        setIsTestnet(chainId === BNB_TESTNET_CHAIN_ID);
      } else {
        setIsTestnet(null);
      }
    };

    checkNetwork();
  }, [chainId, isConnected, client]);

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">Network Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Connection Status:</span>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {isConnected && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Wallet Address:</span>
                <span className="font-mono text-xs">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Network:</span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    isTestnet === true
                      ? 'bg-green-100 text-green-800'
                      : isTestnet === false
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {isTestnet === true
                    ? 'BNB Testnet ✓'
                    : isTestnet === false
                      ? 'Wrong Network ⚠️'
                      : 'Checking...'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Chain ID:</span>
                <span className="text-xs">{chainId}</span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
