'use client';

import { useAccount, useChainId, useReadContract } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BNB_TESTNET_CHAIN_ID,
  TEST63_TOKEN_ADDRESS,
  UNISWAP_V2_ROUTER_ADDRESS,
  erc20Abi,
} from '@/features/swap/constants';

export function ContractStatus() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isCorrectNetwork = chainId === BNB_TESTNET_CHAIN_ID;

  const { data: tokenSymbol, isError: tokenError } = useReadContract({
    address: TEST63_TOKEN_ADDRESS as `0x${string}`,
    abi: [
      {
        constant: true,
        inputs: [],
        name: 'symbol',
        outputs: [{ name: '', type: 'string' }],
        type: 'function',
      },
    ],
    functionName: 'symbol',
    chainId: BNB_TESTNET_CHAIN_ID,
    query: {
      enabled: isConnected && isCorrectNetwork,
    },
  });

  const { data: tokenDecimals, isError: decimalsError } = useReadContract({
    address: TEST63_TOKEN_ADDRESS as `0x${string}`,
    abi: erc20Abi,
    functionName: 'decimals',
    chainId: BNB_TESTNET_CHAIN_ID,
    query: {
      enabled: isConnected && isCorrectNetwork,
    },
  });

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">Contract Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Router Address:</span>
            <span className="font-mono text-xs">
              {UNISWAP_V2_ROUTER_ADDRESS.slice(0, 6)}...{UNISWAP_V2_ROUTER_ADDRESS.slice(-4)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">TEST63 Token Address:</span>
            <span className="font-mono text-xs">
              {TEST63_TOKEN_ADDRESS.slice(0, 6)}...{TEST63_TOKEN_ADDRESS.slice(-4)}
            </span>
          </div>

          {isConnected && isCorrectNetwork && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Token Symbol:</span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    tokenError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}
                >
                  {tokenError ? 'Error' : tokenSymbol ? String(tokenSymbol) : 'Loading...'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Token Decimals:</span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    decimalsError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}
                >
                  {decimalsError ? 'Error' : tokenDecimals?.toString() || 'Loading...'}
                </span>
              </div>
            </>
          )}

          {(!isConnected || !isCorrectNetwork) && (
            <div className="mt-2 rounded bg-yellow-50 p-2 text-xs text-yellow-800">
              {!isConnected
                ? 'Connect your wallet to check contract status'
                : 'Switch to BNB Testnet to check contract status'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
